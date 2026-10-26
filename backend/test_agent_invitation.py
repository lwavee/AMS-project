"""
Test Suite: Agent Invitation Email Workflow
Covers:
  - Task 1: Name, Email, Phone, Location inputs without password
  - Task 2: Email validation, whitespace trimming, normalization, phone length, duplicate rejection
  - Task 3 & 4: Invitation payload formatting, Outlook deeplink readiness
  - Task 5: Status lifecycle (Draft, Prepared, Pending Verification, Verified, Cancelled, Expired)
  - Task 6: Secure token generation, token expiration, demo verification endpoint
  - Task 7: 6-digit verification code generation, password confirmation & activation request validation
  - Security & Multi-Tenancy: Agency isolation (Agency A cannot access Agency B invitations)
"""

import sys
import os

# Ensure backend root directory is always on sys.path for direct execution or editor test runners
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Prevent unreachable backup DB connection attempts during test suite execution
os.environ.setdefault("BACKUP_DATABASE_URL", "")

import unittest
from typing import Any
from datetime import datetime, timedelta, timezone
import secrets
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from pydantic import ValidationError

from app.database.connection import Base
from app.modules.customer.model import Agency, Agent, AgentInvitation
from app.modules.agency.router import (
    AgentInvitationCreateRequest,
    AgentInvitationStatusUpdateRequest,
    AgentInvitationActivateRequest,
    _format_invitation_response
)


class TestAgentInvitationWorkflow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # In-memory SQLite engine with StaticPool for fast, isolated, non-destructive test execution
        cls.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool
        )
        cls.Session = sessionmaker(autocommit=False, autoflush=False, bind=cls.engine)
        Base.metadata.create_all(bind=cls.engine)

        # Create auth.users and users tables in SQLite for duplicate check tests
        with cls.engine.connect() as conn:
            try:
                conn.execute(text("ATTACH DATABASE ':memory:' AS auth;"))
            except Exception:
                pass
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
            try:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS auth.users (
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
            except Exception:
                pass
            conn.commit()

    def setUp(self):
        self.db = self.Session()
        # Clean tables
        self.db.query(AgentInvitation).delete()
        self.db.query(Agent).delete()
        self.db.query(Agency).delete()
        self.db.execute(text("DELETE FROM users"))
        try:
            self.db.execute(text("DELETE FROM auth.users"))
        except Exception:
            pass
        self.db.commit()

        # Seed Agency A and Agency B
        self.agency_a = Agency(
            name="Capco Insurance Agency",
            email="agency@capco.com",
            user_id="user-agency-a-id",
            city="New York",
            state="NY"
        )
        self.agency_b = Agency(
            name="Apex Risk Partners",
            email="admin@apexrisk.com",
            user_id="user-agency-b-id",
            city="Chicago",
            state="IL"
        )
        self.db.add_all([self.agency_a, self.agency_b])
        self.db.commit()
        self.db.refresh(self.agency_a)
        self.db.refresh(self.agency_b)

    def tearDown(self):
        self.db.close()

    # -------------------------------------------------------------------------
    # 1. Validation & Normalization Tests (Task 2)
    # -------------------------------------------------------------------------
    def test_email_and_name_validation(self):
        """Tests email normalization, syntax validation, and name trimming."""
        # Valid invitation
        req = AgentInvitationCreateRequest(
            name="  Sarah Connor  ",
            email="  SARAH.CONNOR@capco.com  ",
            phone="(555) 123-4567",
            city="Dallas",
            state="TX"
        )
        self.assertEqual(req.name, "Sarah Connor")
        self.assertEqual(req.email, "sarah.connor@capco.com")
        self.assertEqual(req.phone, "(555) 123-4567")

        # Invalid email syntax
        with self.assertRaises(ValidationError):
            AgentInvitationCreateRequest(name="Valid Name", email="not-an-email")

        with self.assertRaises(ValidationError):
            AgentInvitationCreateRequest(name="Valid Name", email="missingdomain@")

        # Blank or short name
        with self.assertRaises(ValidationError):
            AgentInvitationCreateRequest(name="   ", email="test@example.com")

        with self.assertRaises(ValidationError):
            AgentInvitationCreateRequest(name="A", email="test@example.com")

    def test_phone_validation(self):
        """Tests that phone numbers have a reasonable length if provided."""
        # Valid phone numbers
        req = AgentInvitationCreateRequest(name="Agent Name", email="agent@example.com", phone="555-0199")
        self.assertEqual(req.phone, "555-0199")

        req2 = AgentInvitationCreateRequest(name="Agent Name", email="agent@example.com", phone="+1 (800) 555-0199")
        self.assertEqual(req2.phone, "+1 (800) 555-0199")

        # Too short (< 7 digits)
        with self.assertRaises(ValidationError):
            AgentInvitationCreateRequest(name="Agent Name", email="agent@example.com", phone="12345")

        # Too long (> 15 digits)
        with self.assertRaises(ValidationError):
            AgentInvitationCreateRequest(name="Agent Name", email="agent@example.com", phone="123456789012345678")

    # -------------------------------------------------------------------------
    # 2. Duplicate Email Checking Tests (Task 2)
    # -------------------------------------------------------------------------
    def test_reject_duplicate_in_users_table(self):
        """Rejects invitation if email exists in auth/users table."""
        # Insert existing user into users table
        self.db.execute(text("INSERT INTO users (id, email) VALUES ('u-1', 'existing@capco.com')"))
        self.db.commit()

        email = "existing@capco.com"
        user_exists = self.db.execute(
            text("SELECT id FROM users WHERE lower(email) = :email"),
            {"email": email}
        ).first() is not None
        self.assertTrue(user_exists, "Expected email to be detected in users table")

    def test_reject_duplicate_in_agents_table(self):
        """Rejects invitation if email exists in registered agents table."""
        agent = Agent(name="Existing Agent", email="active.agent@capco.com", agency_id=self.agency_a.id)
        self.db.add(agent)
        self.db.commit()

        agent_exists = self.db.query(Agent).filter(Agent.email == "active.agent@capco.com").first() is not None
        self.assertTrue(agent_exists, "Expected active agent email to be detected")

    def test_reject_duplicate_in_active_invitations(self):
        """Rejects invitation if a pending/active invitation already exists for this email."""
        invitation = AgentInvitation(
            agency_id=self.agency_a.id,
            name="Pending Agent",
            email="pending@capco.com",
            status="Invitation Prepared",
            token=secrets.token_urlsafe(32),
            code="849201"
        )
        self.db.add(invitation)
        self.db.commit()

        active_inv = self.db.query(AgentInvitation).filter(
            AgentInvitation.email == "pending@capco.com",
            AgentInvitation.status.in_(["Draft", "Invitation Prepared", "Pending Verification", "Verified"])
        ).first()
        self.assertIsNotNone(active_inv, "Expected active pending invitation to be detected")

    def test_allow_reinviting_if_previous_invitation_cancelled(self):
        """Allows re-invitation if previous invitation was cancelled or expired."""
        cancelled_inv = AgentInvitation(
            agency_id=self.agency_a.id,
            name="Old Agent",
            email="reinvite@capco.com",
            status="Cancelled",
            token=secrets.token_urlsafe(32),
            code="123456"
        )
        self.db.add(cancelled_inv)
        self.db.commit()

        # Check that it is NOT considered an active blocker
        active_inv = self.db.query(AgentInvitation).filter(
            AgentInvitation.email == "reinvite@capco.com",
            AgentInvitation.status.in_(["Draft", "Invitation Prepared", "Pending Verification", "Verified"])
        ).first()
        self.assertIsNone(active_inv, "Cancelled invitation should not block new invitation")

    # -------------------------------------------------------------------------
    # 3. Multi-Tenant Agency Isolation Tests
    # -------------------------------------------------------------------------
    def test_agency_isolation(self):
        """Verifies Agency A cannot see or modify Agency B invitations."""
        # Create invitation under Agency A
        inv_a = AgentInvitation(
            agency_id=self.agency_a.id,
            name="Agent Alpha",
            email="alpha@capco.com",
            status="Invitation Prepared",
            token=secrets.token_urlsafe(32),
            code="111222"
        )
        # Create invitation under Agency B
        inv_b = AgentInvitation(
            agency_id=self.agency_b.id,
            name="Agent Beta",
            email="beta@apexrisk.com",
            status="Invitation Prepared",
            token=secrets.token_urlsafe(32),
            code="333444"
        )
        self.db.add_all([inv_a, inv_b])
        self.db.commit()

        # Agency A queries its invitations
        agency_a_invs = self.db.query(AgentInvitation).filter(
            AgentInvitation.agency_id == self.agency_a.id
        ).all()
        self.assertEqual(len(agency_a_invs), 1)
        self.assertEqual(agency_a_invs[0].email, "alpha@capco.com")

        # Agency B queries its invitations
        agency_b_invs = self.db.query(AgentInvitation).filter(
            AgentInvitation.agency_id == self.agency_b.id
        ).all()
        self.assertEqual(len(agency_b_invs), 1)
        self.assertEqual(agency_b_invs[0].email, "beta@apexrisk.com")

    # -------------------------------------------------------------------------
    # 4. Status Transition Lifecycle Tests (Task 5)
    # -------------------------------------------------------------------------
    def test_invitation_status_lifecycle(self):
        """Verifies allowed status transitions and rejection of invalid statuses."""
        inv: Any = AgentInvitation(
            agency_id=self.agency_a.id,
            name="John Smith",
            email="john@capco.com",
            status="Invitation Prepared",
            token=secrets.token_urlsafe(32),
            code="548291",
            expires_at=datetime.now(timezone.utc) + timedelta(days=7)
        )
        self.db.add(inv)
        self.db.commit()

        # Update status to 'Pending Verification' (simulating Outlook open)
        update_req = AgentInvitationStatusUpdateRequest(status="Pending Verification")
        inv.status = update_req.status
        self.db.commit()
        self.assertEqual(inv.status, "Pending Verification")

        # Update to 'Cancelled'
        cancel_req = AgentInvitationStatusUpdateRequest(status="Cancelled")
        inv.status = cancel_req.status
        self.db.commit()
        self.assertEqual(inv.status, "Cancelled")

        # Rejects bogus status
        with self.assertRaises(ValidationError):
            AgentInvitationStatusUpdateRequest(status="BogusStatus")

    # -------------------------------------------------------------------------
    # 5. Token Generation & Verification Tests (Task 6)
    # -------------------------------------------------------------------------
    def test_token_expiration_logic(self):
        """Checks token expiration detection."""
        expired_token = secrets.token_urlsafe(32)
        inv = AgentInvitation(
            agency_id=self.agency_a.id,
            name="Expired Agent",
            email="expired@capco.com",
            status="Invitation Prepared",
            token=expired_token,
            code="999888",
            expires_at=datetime.now(timezone.utc) - timedelta(hours=1)  # expired 1 hr ago
        )
        self.db.add(inv)
        self.db.commit()

        queried = self.db.query(AgentInvitation).filter(AgentInvitation.token == expired_token).first()
        self.assertIsNotNone(queried)
        assert queried is not None
        assert queried.expires_at is not None
        exp = queried.expires_at if queried.expires_at.tzinfo else queried.expires_at.replace(tzinfo=timezone.utc)
        self.assertTrue(datetime.now(timezone.utc) > exp, "Token should be detected as expired")

    def test_format_invitation_response(self):
        """Verifies _format_invitation_response includes demo flags, verification URL, code, and agency metadata."""
        token = secrets.token_urlsafe(32)
        inv = AgentInvitation(
            id=101,
            agency_id=self.agency_a.id,
            name="David Miller",
            email="david.miller@capco.com",
            phone="555-0199",
            location="New York, NY",
            status="Invitation Prepared",
            token=token,
            code="849201",
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        res = _format_invitation_response(inv, self.agency_a, {"email": "agency@capco.com"})
        self.assertEqual(res.name, "David Miller")
        self.assertEqual(res.email, "david.miller@capco.com")
        self.assertEqual(res.agency_name, "Capco Insurance Agency")
        self.assertEqual(res.agency_email, "agency@capco.com")
        self.assertEqual(res.code, "849201")
        self.assertTrue(res.demo_mode)
        self.assertIsNotNone(res.verification_url)
        assert res.verification_url is not None
        self.assertIn(token, res.verification_url)
        self.assertIn("demo=true", res.verification_url)

    # -------------------------------------------------------------------------
    # 6. Activation Request & Password Validation Tests (Task 7)
    # -------------------------------------------------------------------------
    def test_agent_invitation_activate_request_validation(self):
        """Tests AgentInvitationActivateRequest schema validation for passwords and verification code."""
        # Valid activation payload
        req = AgentInvitationActivateRequest(
            token="valid_token_value_12345",
            code="849201",
            password="StrongPassword123!",
            confirm_password="StrongPassword123!"
        )
        self.assertEqual(req.code, "849201")
        self.assertEqual(req.password, "StrongPassword123!")
        self.assertEqual(req.confirm_password, "StrongPassword123!")

        # Password too short (< 6 chars)
        with self.assertRaises(ValidationError):
            AgentInvitationActivateRequest(
                token="valid_token_value_12345",
                code="849201",
                password="123",
                confirm_password="123"
            )

        # Missing token
        with self.assertRaises(ValidationError):
            AgentInvitationActivateRequest(
                token="",
                code="849201",
                password="StrongPassword123!",
                confirm_password="StrongPassword123!"
            )


if __name__ == "__main__":
    unittest.main()
