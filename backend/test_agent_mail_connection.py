"""
Unit and integration tests for Business Mailbox OAuth & Email Audit Logging (Tasks 5 & 7).
Tests:
- Token encryption & decryption at rest (with tamper detection).
- Mailbox status reporting (unconfigured vs configured).
- OAuth authorize endpoint behavior (rejects when unconfigured, generates state when configured).
- Mailbox disconnect endpoint.
- EmailAuditLog persistence and querying.
"""

import unittest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.connection import Base, get_db
from app.modules.customer.model import Agency, Agent, AgentMailbox, EmailAuditLog
from app.modules.agency.email_security import encrypt_token, decrypt_token
from app.modules.agency.email_service import MicrosoftEmailService
from app.core.config import settings

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


class TestEmailSecurity(unittest.TestCase):
    def test_encrypt_and_decrypt_token(self):
        secret_token = "M.R3_mock_refresh_token_xyz_9876543210"
        encrypted = encrypt_token(secret_token)
        self.assertIsNotNone(encrypted)
        self.assertNotEqual(encrypted, secret_token)

        decrypted = decrypt_token(encrypted)
        self.assertEqual(decrypted, secret_token)

    def test_tampered_token_rejected(self):
        secret_token = "another_token_abc_123"
        encrypted = encrypt_token(secret_token)
        assert encrypted is not None
        # Tamper with the base64 ciphertext
        tampered = encrypted[:-4] + "AAAA"
        decrypted = decrypt_token(tampered)
        self.assertIsNone(decrypted)

    def test_empty_or_none_token(self):
        self.assertIsNone(encrypt_token(""))
        self.assertIsNone(encrypt_token(None))
        self.assertIsNone(decrypt_token(""))
        self.assertIsNone(decrypt_token(None))
        self.assertIsNone(decrypt_token("invalid_format_string"))


class TestMailboxAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=test_engine)
        cls.orig_override = app.dependency_overrides.get(get_db)
        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        Base.metadata.drop_all(bind=test_engine)
        if cls.orig_override:
            app.dependency_overrides[get_db] = cls.orig_override
        else:
            app.dependency_overrides.pop(get_db, None)

    def setUp(self):
        self.db = TestingSessionLocal()
        # Create test agency with required email and agent
        self.agency = Agency(name="Sterling Insurance Group", email="admin@sterling-demo.com")
        self.db.add(self.agency)
        self.db.commit()
        self.db.refresh(self.agency)

        self.agent = Agent(
            name="Sarah Jenkins",
            email="sarah.jenkins@sterling-demo.com",
            agency_id=self.agency.id
        )
        self.db.add(self.agent)
        self.db.commit()
        self.db.refresh(self.agent)

    def tearDown(self):
        self.db.query(EmailAuditLog).delete()
        self.db.query(AgentMailbox).delete()
        self.db.query(Agent).delete()
        self.db.query(Agency).delete()
        self.db.commit()
        self.db.close()

    def test_mailbox_status_unconnected(self):
        res = self.client.get(f"/api/agency/mail/status?email={self.agent.email}")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "Not Connected")
        self.assertEqual(data["provider"], "microsoft")
        self.assertIn("configured", data)

    def test_mailbox_status_connected(self):
        mailbox = AgentMailbox(
            agent_id=self.agent.id,
            agency_id=self.agency.id,
            provider="microsoft",
            email=self.agent.email,
            display_name="Sarah Jenkins",
            status="Connected",
            connected_at=datetime.now(timezone.utc)
        )
        self.db.add(mailbox)
        self.db.commit()

        res = self.client.get(f"/api/agency/mail/status?email={self.agent.email}")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "Connected")
        self.assertEqual(data["email"], self.agent.email)
        self.assertEqual(data["display_name"], "Sarah Jenkins")

    def test_oauth_authorize_unconfigured_credentials(self):
        orig_id = settings.MICROSOFT_CLIENT_ID
        settings.MICROSOFT_CLIENT_ID = None

        try:
            res = self.client.get(f"/api/agency/mail/oauth/authorize?email={self.agent.email}")
            self.assertEqual(res.status_code, 400)
            data = res.json()
            self.assertIn("detail", data)
            self.assertIn("not configured", data["detail"].lower())
        finally:
            settings.MICROSOFT_CLIENT_ID = orig_id

    def test_oauth_authorize_configured_returns_url_and_state(self):
        orig_id = settings.MICROSOFT_CLIENT_ID
        orig_secret = settings.MICROSOFT_CLIENT_SECRET
        settings.MICROSOFT_CLIENT_ID = "mock-client-id-12345"
        settings.MICROSOFT_CLIENT_SECRET = "mock-secret-abcde"

        try:
            res = self.client.get(f"/api/agency/mail/oauth/authorize?email={self.agent.email}")
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertIn("authorize_url", data)
            self.assertIn("login.microsoftonline.com", data["authorize_url"])
            self.assertIn("state", data)
            self.assertIn("client_id=mock-client-id-12345", data["authorize_url"])
            self.assertIn("Mail.Send", data["authorize_url"])
        finally:
            settings.MICROSOFT_CLIENT_ID = orig_id
            settings.MICROSOFT_CLIENT_SECRET = orig_secret

    def test_disconnect_mailbox(self):
        mailbox = AgentMailbox(
            agent_id=self.agent.id,
            agency_id=self.agency.id,
            provider="microsoft",
            email=self.agent.email,
            encrypted_refresh_token=encrypt_token("mock_token"),
            status="Connected"
        )
        self.db.add(mailbox)
        self.db.commit()

        res = self.client.post(f"/api/agency/mail/disconnect?email={self.agent.email}")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])

        # Check DB state
        mb = self.db.query(AgentMailbox).filter(AgentMailbox.agent_id == self.agent.id).first()
        self.assertIsNotNone(mb)
        self.assertEqual(mb.status, "Not Connected")
        self.assertIsNone(mb.encrypted_refresh_token)

    def test_email_audit_log_persistence(self):
        audit_entry = EmailAuditLog(
            agency_id=self.agency.id,
            agent_id=self.agent.id,
            sender_email=self.agent.email,
            recipient_email="client@acme-corp.com",
            subject="Certificate of Liability Insurance - Policy #GL-99482",
            has_attachments=True,
            attachment_names="COI_GL_99482.pdf",
            status="sent",
            graph_message_id="AAMkAGI2T...="
        )
        self.db.add(audit_entry)
        self.db.commit()

        saved = self.db.query(EmailAuditLog).filter(EmailAuditLog.agent_id == self.agent.id).first()
        self.assertIsNotNone(saved)
        self.assertEqual(saved.recipient_email, "client@acme-corp.com")
        self.assertEqual(saved.status, "sent")
        self.assertTrue(saved.has_attachments)
        self.assertEqual(saved.attachment_names, "COI_GL_99482.pdf")
        self.assertEqual(saved.graph_message_id, "AAMkAGI2T...=")


if __name__ == "__main__":
    unittest.main()
