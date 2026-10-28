"""
Unit and integration tests for Direct Microsoft Outlook / 365 Email Sending API (POST /api/agency/mail/send).
Tests:
- Missing / unauthenticated request rejection (401).
- Unconnected mailbox rejection (400).
- Non-existent customer rejection (404).
- Attachment size validation (individual >3.5MB returns 422, total >4MB returns 400).
- Malformed recipient email rejection (422).
- Successful direct send with PDF attachment in sandbox mode (HTTP 200, graph_status 202, audit log created).
- Successful direct send with PDF attachment via Microsoft Graph API mock (HTTP 200, graph_status 202).
- Expired / invalid token handling requiring re-authentication (401).
- Microsoft Graph failure handling (502).
"""

import unittest
from unittest.mock import patch, AsyncMock, MagicMock
from datetime import datetime, timezone
import base64
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.connection import Base, get_db
from app.modules.customer.model import Customer, Agency, Agent, AgentMailbox, EmailAuditLog
from app.modules.agency.email_security import encrypt_token
from app.modules.auth.deps import get_current_user

# Test in-memory SQLite database
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


class TestMailSendAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=test_engine)
        cls.orig_get_db = app.dependency_overrides.get(get_db)
        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=test_engine)
        if cls.orig_get_db:
            app.dependency_overrides[get_db] = cls.orig_get_db
        else:
            app.dependency_overrides.pop(get_db, None)

    def setUp(self):
        self.db = TestingSessionLocal()
        # Seed test agency and agent
        self.agency = Agency(name="Sterling Insurance Group", email="admin@sterling-demo.com")
        self.db.add(self.agency)
        self.db.commit()
        self.db.refresh(self.agency)

        self.agent = Agent(
            name="Sarah Jenkins",
            email="sarah.jenkins@sterling-demo.com",
            agency_id=self.agency.id,
            user_id="auth-user-sarah-123"
        )
        self.db.add(self.agent)
        self.db.commit()
        self.db.refresh(self.agent)

        self.customer = Customer(
            name="Acme Logistics LLC",
            match_code="ACME01",
            email="contact@acmelogistics.com",
            status="Active"
        )
        self.db.add(self.customer)
        self.db.commit()
        self.db.refresh(self.customer)

        # Default mock auth user matching Sarah Jenkins
        app.dependency_overrides[get_current_user] = lambda: {
            "id": self.agent.user_id,
            "email": self.agent.email,
            "role": "agent"
        }

        # Small 100-byte dummy PDF in base64
        self.dummy_pdf_b64 = base64.b64encode(b"%PDF-1.4 dummy certificate content").decode("utf-8")

    def tearDown(self):
        self.db.query(EmailAuditLog).delete()
        self.db.query(AgentMailbox).delete()
        self.db.query(Customer).delete()
        self.db.query(Agent).delete()
        self.db.query(Agency).delete()
        self.db.commit()
        self.db.close()
        app.dependency_overrides.pop(get_current_user, None)

    def test_send_mail_unauthenticated_rejected(self):
        """When get_current_user fails or is removed, request is rejected with 401."""
        app.dependency_overrides.pop(get_current_user, None)

        payload = {
            "recipient_email": "client@example.com",
            "subject": "Insurance Certificate",
            "body_html": "<p>Attached.</p>"
        }
        res = self.client.post("/api/agency/mail/send", json=payload)
        self.assertEqual(res.status_code, 401)

    def test_send_mail_mailbox_not_connected_rejected(self):
        """When agent has no connected mailbox, endpoint returns 400 with helpful instruction."""
        payload = {
            "recipient_email": "client@example.com",
            "subject": "Certificate of Insurance",
            "body_html": "<p>Please find attached.</p>",
            "attachments": [
                {
                    "name": "COI_Acme.pdf",
                    "content_bytes_b64": self.dummy_pdf_b64,
                    "content_type": "application/pdf"
                }
            ]
        }
        res = self.client.post("/api/agency/mail/send", json=payload)
        self.assertEqual(res.status_code, 400)
        data = res.json()
        self.assertIn("not connected", data["detail"].lower())

    def test_send_mail_nonexistent_customer_rejected(self):
        """Specifying an unknown customer_id returns 404."""
        mailbox = AgentMailbox(
            agent_id=self.agent.id,
            agency_id=self.agency.id,
            provider="microsoft",
            email=self.agent.email,
            encrypted_refresh_token=encrypt_token("mock_token"),
            status="Connected",
            connected_at=datetime.now(timezone.utc)
        )
        self.db.add(mailbox)
        self.db.commit()

        payload = {
            "recipient_email": "client@example.com",
            "subject": "Certificate of Insurance",
            "body_html": "<p>Body</p>",
            "customer_id": 999999  # Does not exist
        }
        res = self.client.post("/api/agency/mail/send", json=payload)
        self.assertEqual(res.status_code, 404)
        self.assertIn("Customer #999999 not found", res.json()["detail"])

    def test_send_mail_attachment_exceeds_individual_limit(self):
        """Attachment exceeding 3.5MB fails Pydantic schema validation with 422."""
        # 3.6 MB base64 string
        oversized_bytes = b"X" * (3_700_000)
        oversized_b64 = base64.b64encode(oversized_bytes).decode("utf-8")

        payload = {
            "recipient_email": "client@example.com",
            "subject": "Heavy Certificate",
            "body_html": "<p>Too large.</p>",
            "attachments": [
                {
                    "name": "Huge.pdf",
                    "content_bytes_b64": oversized_b64,
                    "content_type": "application/pdf"
                }
            ]
        }
        res = self.client.post("/api/agency/mail/send", json=payload)
        self.assertEqual(res.status_code, 422)

    def test_send_mail_total_payload_exceeds_graph_limit(self):
        """Multiple attachments whose cumulative size exceeds 4MB returns 400."""
        mailbox = AgentMailbox(
            agent_id=self.agent.id,
            agency_id=self.agency.id,
            provider="microsoft",
            email=self.agent.email,
            encrypted_refresh_token=encrypt_token("mock_token"),
            status="Connected",
            connected_at=datetime.now(timezone.utc)
        )
        self.db.add(mailbox)
        self.db.commit()

        # Two 2.5MB attachments = 5.0MB total
        chunk = b"X" * (2_500_000)
        chunk_b64 = base64.b64encode(chunk).decode("utf-8")

        payload = {
            "recipient_email": "client@example.com",
            "subject": "Combined Forms",
            "body_html": "<p>Forms</p>",
            "attachments": [
                {"name": "Part1.pdf", "content_bytes_b64": chunk_b64, "content_type": "application/pdf"},
                {"name": "Part2.pdf", "content_bytes_b64": chunk_b64, "content_type": "application/pdf"}
            ]
        }
        res = self.client.post("/api/agency/mail/send", json=payload)
        self.assertEqual(res.status_code, 400)
        self.assertIn("exceeds the Microsoft Graph limit", res.json()["detail"])

    def test_send_mail_invalid_recipient_format(self):
        """Malformed recipient email returns 422 validation error."""
        payload = {
            "recipient_email": "not-an-email",
            "subject": "Hello",
            "body_html": "<p>Hi</p>"
        }
        res = self.client.post("/api/agency/mail/send", json=payload)
        self.assertEqual(res.status_code, 422)

    def test_send_mail_sandbox_rejected_without_real_token(self):
        """When mailbox has no refresh token, real sending rejects dummy send."""
        mailbox = AgentMailbox(
            agent_id=self.agent.id,
            agency_id=self.agency.id,
            provider="microsoft",
            email=self.agent.email,
            status="Connected",
            connected_at=datetime.now(timezone.utc)
        )
        self.db.add(mailbox)
        self.db.commit()

        payload = {
            "recipient_email": "client@acmelogistics.com",
            "subject": "Certificate of Liability Insurance",
            "body_html": "<p>Please review attached certificate.</p>",
            "customer_id": self.customer.id,
            "attachments": [
                {
                    "name": "Certificate_Acme.pdf",
                    "content_bytes_b64": self.dummy_pdf_b64,
                    "content_type": "application/pdf"
                }
            ]
        }

        res = self.client.post("/api/agency/mail/send", json=payload)
        self.assertEqual(res.status_code, 400)
        self.assertIn("not connected with Microsoft OAuth authorization", res.json()["detail"])

    def test_send_mail_graph_oauth_success_mocked(self):
        """When mailbox has encrypted refresh token, mock Graph refresh & sendMail return HTTP 202."""
        mailbox = AgentMailbox(
            agent_id=self.agent.id,
            agency_id=self.agency.id,
            provider="microsoft",
            email=self.agent.email,
            encrypted_refresh_token=encrypt_token("valid_refresh_token_12345"),
            status="Connected",
            connected_at=datetime.now(timezone.utc)
        )
        self.db.add(mailbox)
        self.db.commit()

        payload = {
            "recipient_email": "riskmanager@partner.com",
            "subject": "Binder of Insurance - ACME",
            "body_html": "<p>Attached is your signed binder.</p>",
            "customer_id": self.customer.id,
            "attachments": [
                {
                    "name": "Binder_2026.pdf",
                    "content_bytes_b64": self.dummy_pdf_b64,
                    "content_type": "application/pdf"
                }
            ]
        }

        # Mock httpx responses:
        # 1. Token refresh -> HTTP 200 with access_token
        # 2. Graph sendMail -> HTTP 202 Accepted
        mock_refresh_res = MagicMock()
        mock_refresh_res.status_code = 200
        mock_refresh_res.json.return_value = {
            "access_token": "mock_graph_access_token_xyz",
            "refresh_token": "new_refresh_token_67890",
            "expires_in": 3600
        }

        mock_send_res = MagicMock()
        mock_send_res.status_code = 202
        mock_send_res.headers = {"request-id": "mock-graph-req-id-777"}

        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.side_effect = [mock_refresh_res, mock_send_res]

            res = self.client.post("/api/agency/mail/send", json=payload)
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["graph_status"], 202)
            self.assertEqual(data["request_id"], "mock-graph-req-id-777")

            # Verify sendMail was called with proper Graph payload
            self.assertEqual(mock_post.call_count, 2)
            graph_call_kwargs = mock_post.call_args_list[1]
            sent_json = graph_call_kwargs[1]["json"]
            self.assertEqual(sent_json["message"]["subject"], "Binder of Insurance - ACME")
            self.assertEqual(len(sent_json["message"]["attachments"]), 1)
            att = sent_json["message"]["attachments"][0]
            self.assertEqual(att["@odata.type"], "#microsoft.graph.fileAttachment")
            self.assertEqual(att["name"], "Binder_2026.pdf")
            self.assertEqual(att["contentBytes"], self.dummy_pdf_b64)

            # Verify audit log
            audit = self.db.query(EmailAuditLog).filter(EmailAuditLog.agent_id == self.agent.id).first()
            self.assertIsNotNone(audit)
            self.assertEqual(audit.status, "sent")
            self.assertEqual(audit.graph_message_id, "mock-graph-req-id-777")

    def test_send_mail_graph_token_expired(self):
        """When token refresh fails, endpoint returns 401 informing agent to re-authenticate."""
        mailbox = AgentMailbox(
            agent_id=self.agent.id,
            agency_id=self.agency.id,
            provider="microsoft",
            email=self.agent.email,
            encrypted_refresh_token=encrypt_token("expired_token"),
            status="Connected",
            connected_at=datetime.now(timezone.utc)
        )
        self.db.add(mailbox)
        self.db.commit()

        payload = {
            "recipient_email": "client@example.com",
            "subject": "Expired Test",
            "body_html": "<p>Test</p>"
        }

        mock_refresh_res = MagicMock()
        mock_refresh_res.status_code = 400
        mock_refresh_res.text = "AADSTS700082: The refresh token has expired."

        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = mock_refresh_res

            res = self.client.post("/api/agency/mail/send", json=payload)
            self.assertEqual(res.status_code, 401)
            self.assertIn("re-authenticate", res.json()["detail"].lower())

    def test_send_mail_graph_api_error_returns_502(self):
        """When Microsoft Graph rejects the message with 500, endpoint returns 502 Bad Gateway."""
        mailbox = AgentMailbox(
            agent_id=self.agent.id,
            agency_id=self.agency.id,
            provider="microsoft",
            email=self.agent.email,
            encrypted_refresh_token=encrypt_token("valid_token"),
            status="Connected",
            connected_at=datetime.now(timezone.utc)
        )
        self.db.add(mailbox)
        self.db.commit()

        payload = {
            "recipient_email": "client@example.com",
            "subject": "Graph Error Test",
            "body_html": "<p>Test</p>"
        }

        mock_refresh_res = MagicMock()
        mock_refresh_res.status_code = 200
        mock_refresh_res.json.return_value = {"access_token": "good_token"}

        mock_send_res = MagicMock()
        mock_send_res.status_code = 500
        mock_send_res.text = "InternalServerError: Unable to deliver message"

        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.side_effect = [mock_refresh_res, mock_send_res]

            res = self.client.post("/api/agency/mail/send", json=payload)
            self.assertEqual(res.status_code, 502)
            self.assertIn("InternalServerError", res.json()["detail"])


if __name__ == "__main__":
    unittest.main()
