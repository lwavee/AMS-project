"""
Integration Tests: Agent Invitation API Endpoints
Tests:
  - POST /api/agency/invitations
  - GET /api/agency/invitations
  - PATCH /api/agency/invitations/{id}/status
  - GET /api/agency/invitations/verify
  - DELETE /api/agency/invitations/{id}
"""

import unittest
from datetime import datetime, timedelta
import secrets
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.connection import get_db, Base
from app.modules.auth.deps import get_current_user
from app.modules.customer.model import Agency, Agent, AgentInvitation

# Isolated test DB with StaticPool so memory DB is shared across threads/connections
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
Base.metadata.create_all(bind=test_engine)

with test_engine.connect() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            encrypted_password TEXT,
            raw_user_meta_data TEXT,
            email_confirmed_at TIMESTAMP,
            role TEXT,
            aud TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """))
    conn.commit()


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


CURRENT_MOCK_USER = {
    "id": "mock-agency-user-id",
    "email": "agency@capco.com",
    "role": "agency"
}

def override_get_current_user():
    return CURRENT_MOCK_USER


app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user


class TestAgentInvitationAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.db = TestingSessionLocal()
        self.db.query(AgentInvitation).delete()
        self.db.query(Agent).delete()
        self.db.query(Agency).delete()
        self.db.execute(text("DELETE FROM users"))
        self.db.commit()

        # Seed Agency
        self.agency = Agency(
            name="Capco Insurance Agency",
            email="agency@capco.com",
            user_id="mock-agency-user-id",
            city="Dallas",
            state="TX"
        )
        self.db.add(self.agency)
        self.db.commit()
        self.db.refresh(self.agency)

    def tearDown(self):
        self.db.close()

    def test_create_invitation_success(self):
        payload = {
            "name": "Jane Doe",
            "email": "jane.doe@example.com",
            "phone": "(555) 019-2834",
            "city": "Austin",
            "state": "TX"
        }
        res = self.client.post("/api/agency/invitations", json=payload)
        self.assertEqual(res.status_code, 200, res.text)
        data = res.json()
        self.assertEqual(data["name"], "Jane Doe")
        self.assertEqual(data["email"], "jane.doe@example.com")
        self.assertEqual(data["location"], "Austin, TX")
        self.assertEqual(data["status"], "Invitation Prepared")
        self.assertTrue(data["demo_mode"])
        self.assertIn("token", data)
        self.assertIn("/verify-invitation?token=", data["verification_url"])

    def test_create_invitation_duplicate_rejection(self):
        # Create first invitation
        payload = {
            "name": "Jane Doe",
            "email": "duplicate@example.com",
            "phone": "(555) 019-2834"
        }
        res1 = self.client.post("/api/agency/invitations", json=payload)
        self.assertEqual(res1.status_code, 200)

        # Attempt to create with same email
        res2 = self.client.post("/api/agency/invitations", json=payload)
        self.assertEqual(res2.status_code, 400)
        self.assertIn("already exists", res2.json()["detail"].lower())

    def test_list_invitations(self):
        # Create 2 invitations
        self.client.post("/api/agency/invitations", json={"name": "Agent 1", "email": "agent1@example.com"})
        self.client.post("/api/agency/invitations", json={"name": "Agent 2", "email": "agent2@example.com"})

        res = self.client.get("/api/agency/invitations")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data), 2)
        emails = [inv["email"] for inv in data]
        self.assertIn("agent1@example.com", emails)
        self.assertIn("agent2@example.com", emails)

    def test_update_invitation_status(self):
        create_res = self.client.post("/api/agency/invitations", json={"name": "Agent 3", "email": "agent3@example.com"})
        inv_id = create_res.json()["id"]

        patch_res = self.client.patch(f"/api/agency/invitations/{inv_id}/status", json={"status": "Pending Verification"})
        self.assertEqual(patch_res.status_code, 200)
        self.assertEqual(patch_res.json()["status"], "Pending Verification")

    def test_verify_invitation_endpoint(self):
        create_res = self.client.post("/api/agency/invitations", json={"name": "Agent 4", "email": "agent4@example.com"})
        token = create_res.json()["token"]

        verify_res = self.client.get(f"/api/agency/invitations/verify?token={token}")
        self.assertEqual(verify_res.status_code, 200)
        data = verify_res.json()
        self.assertTrue(data["valid"])
        self.assertTrue(data["demo_mode"])
        self.assertEqual(data["name"], "Agent 4")
        self.assertEqual(data["agency_name"], "Capco Insurance Agency")

    def test_delete_invitation(self):
        create_res = self.client.post("/api/agency/invitations", json={"name": "Agent 5", "email": "agent5@example.com"})
        inv_id = create_res.json()["id"]

        del_res = self.client.delete(f"/api/agency/invitations/{inv_id}")
        self.assertEqual(del_res.status_code, 200)

        # Ensure it is gone from list
        list_res = self.client.get("/api/agency/invitations")
        inv_ids = [inv["id"] for inv in list_res.json()]
        self.assertNotIn(inv_id, inv_ids)

    def test_activate_wrong_code_fails(self):
        create_res = self.client.post("/api/agency/invitations", json={"name": "Agent Code Test", "email": "code_test@example.com"})
        token = create_res.json()["token"]
        correct_code = create_res.json()["code"]

        # Submit wrong code
        activate_res = self.client.post("/api/agency/invitations/activate", json={
            "token": token,
            "code": "999999" if correct_code != "999999" else "111111",
            "password": "Password123!",
            "confirm_password": "Password123!"
        })
        self.assertEqual(activate_res.status_code, 400)
        self.assertIn("Verification code is incorrect", activate_res.json()["detail"])

    def test_activate_correct_code_succeeds(self):
        create_res = self.client.post("/api/agency/invitations", json={"name": "Agent Success", "email": "success_agent@example.com"})
        token = create_res.json()["token"]
        correct_code = create_res.json()["code"]

        # Submit same correct code
        activate_res = self.client.post("/api/agency/invitations/activate", json={
            "token": token,
            "code": correct_code,
            "password": "ValidPassword123!",
            "confirm_password": "ValidPassword123!"
        })
        self.assertEqual(activate_res.status_code, 200)
        data = activate_res.json()
        self.assertTrue(data["success"])
        self.assertIn("access_token", data)
        self.assertEqual(data["email"], "success_agent@example.com")


if __name__ == "__main__":
    unittest.main()
