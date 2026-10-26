"""
Email Service & Microsoft Graph OAuth Integration (Task 5 & 7)
Handles:
  - Microsoft OAuth 2.0 authorization code flow for agent business mailboxes
  - Secure state generation & validation
  - Mailbox identity retrieval and policy validation
  - Encrypted token persistence at rest
  - Real email sending via Microsoft Graph API with attachments and audit logging
"""

import json
import logging
import base64
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.modules.customer.model import Agent, AgentMailbox, EmailAuditLog
from app.modules.agency.email_security import encrypt_token, decrypt_token

logger = logging.getLogger("ams360.email_service")

# Delegated Microsoft Graph permissions requested for business mailbox integration
MICROSOFT_SCOPES = [
    "openid",
    "profile",
    "offline_access",
    "User.Read",
    "Mail.Send"
]


class MicrosoftEmailService:
    @staticmethod
    def is_configured() -> bool:
        """
        Checks whether real Microsoft OAuth credentials are configured in the environment.
        """
        return bool(
            settings.MICROSOFT_CLIENT_ID
            and settings.MICROSOFT_CLIENT_SECRET
            and settings.MICROSOFT_REDIRECT_URI
        )

    @classmethod
    def get_authorization_url(cls, agent_id: int, agency_id: int, state_token: str) -> str:
        """
        Builds the Microsoft OAuth 2.0 authorization code URL.
        """
        if not cls.is_configured():
            raise ValueError(
                "Microsoft OAuth credentials are not configured. "
                "Please set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET in backend configuration."
            )

        tenant_id = settings.MICROSOFT_TENANT_ID or "organizations"
        base_auth_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize"

        scopes_str = " ".join(MICROSOFT_SCOPES)
        params = {
            "client_id": settings.MICROSOFT_CLIENT_ID,
            "response_type": "code",
            "redirect_uri": settings.MICROSOFT_REDIRECT_URI,
            "response_mode": "query",
            "scope": scopes_str,
            "state": state_token,
            "prompt": "select_account"
        }

        # Build URL with encoded parameters
        import urllib.parse
        return f"{base_auth_url}?{urllib.parse.urlencode(params)}"

    @classmethod
    async def exchange_code_for_tokens(cls, code: str) -> Dict[str, Any]:
        """
        Exchanges authorization code for access and refresh tokens.
        """
        tenant_id = settings.MICROSOFT_TENANT_ID or "organizations"
        token_endpoint = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"

        data = {
            "client_id": settings.MICROSOFT_CLIENT_ID,
            "client_secret": settings.MICROSOFT_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.MICROSOFT_REDIRECT_URI,
            "scope": " ".join(MICROSOFT_SCOPES)
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(token_endpoint, data=data)
            if res.status_code != 200:
                logger.error(f"Failed to exchange Microsoft OAuth code: {res.text}")
                raise ValueError("Failed to authenticate with Microsoft OAuth. Invalid code or configuration.")
            return res.json()

    @classmethod
    async def get_user_mailbox_identity(cls, access_token: str) -> Dict[str, Any]:
        """
        Retrieves user mailbox identity from Microsoft Graph API /v1.0/me.
        """
        async with httpx.AsyncClient(timeout=15.0) as client:
            headers = {"Authorization": f"Bearer {access_token}"}
            res = await client.get("https://graph.microsoft.com/v1.0/me", headers=headers)
            if res.status_code != 200:
                logger.error(f"Failed to fetch Microsoft Graph user profile: {res.text}")
                raise ValueError("Failed to retrieve mailbox identity from Microsoft Graph.")
            data = res.json()
            email = data.get("mail") or data.get("userPrincipalName") or ""
            return {
                "email": email.strip().lower(),
                "display_name": data.get("displayName") or "",
                "id": data.get("id") or ""
            }

    @classmethod
    async def refresh_access_token(cls, mailbox: AgentMailbox, db: Session) -> Optional[str]:
        """
        Uses decrypted refresh token to obtain a fresh access token from Microsoft.
        """
        if not mailbox.encrypted_refresh_token:
            mailbox.status = "Connection Expired"
            db.commit()
            return None

        refresh_token = decrypt_token(mailbox.encrypted_refresh_token)
        if not refresh_token:
            mailbox.status = "Connection Expired"
            db.commit()
            return None

        tenant_id = settings.MICROSOFT_TENANT_ID or "organizations"
        token_endpoint = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"

        data = {
            "client_id": settings.MICROSOFT_CLIENT_ID,
            "client_secret": settings.MICROSOFT_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
            "scope": " ".join(MICROSOFT_SCOPES)
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(token_endpoint, data=data)
                if res.status_code != 200:
                    mailbox.status = "Connection Expired"
                    mailbox.last_error = f"Token refresh failed: {res.text}"
                    db.commit()
                    return None

                token_data = res.json()
                new_refresh_token = token_data.get("refresh_token")
                if new_refresh_token:
                    mailbox.encrypted_refresh_token = encrypt_token(new_refresh_token)
                
                expires_in = token_data.get("expires_in", 3600)
                mailbox.expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
                mailbox.status = "Connected"
                mailbox.updated_at = datetime.now(timezone.utc)
                db.commit()
                return token_data.get("access_token")
        except Exception as e:
            logger.error(f"Exception refreshing Microsoft token: {e}")
            mailbox.status = "Connection Error"
            mailbox.last_error = str(e)
            db.commit()
            return None

    @classmethod
    async def send_agent_email(
        cls,
        agent_id: int,
        recipient_email: str,
        subject: str,
        body_html: str,
        attachments: Optional[List[Dict[str, Any]]] = None,
        customer_id: Optional[int] = None,
        policy_id: Optional[int] = None,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Sends an email from the authorized agent mailbox via Microsoft Graph API.
        Saves to Sent Items and records in email_audit_logs.
        Attachments format: [{'name': 'Certificate.pdf', 'content_bytes_b64': '...', 'content_type': 'application/pdf'}]
        """
        if not db:
            raise ValueError("Database session is required for audit recording.")

        mailbox = db.query(AgentMailbox).filter(AgentMailbox.agent_id == agent_id).first()
        if not mailbox or mailbox.status != "Connected":
            raise ValueError("Agent business mailbox is not connected. Please connect email first.")

        access_token = await cls.refresh_access_token(mailbox, db)
        if not access_token:
            raise ValueError("Mailbox authorization has expired. Please re-authenticate your mailbox.")

        # Construct Microsoft Graph message payload
        message_payload: Dict[str, Any] = {
            "message": {
                "subject": subject,
                "body": {
                    "contentType": "HTML",
                    "content": body_html
                },
                "toRecipients": [
                    {
                        "emailAddress": {
                            "address": recipient_email.strip()
                        }
                    }
                ]
            },
            "saveToSentItems": True
        }

        # Add attachments if provided
        attachment_names = []
        if attachments:
            msg_attachments = []
            for att in attachments:
                name = att.get("name", "attachment.pdf")
                content = att.get("content_bytes_b64", "")
                c_type = att.get("content_type", "application/pdf")
                msg_attachments.append({
                    "@odata.type": "#microsoft.graph.fileAttachment",
                    "name": name,
                    "contentType": c_type,
                    "contentBytes": content
                })
                attachment_names.append(name)
            message_payload["message"]["attachments"] = msg_attachments

        send_url = "https://graph.microsoft.com/v1.0/me/sendMail"
        async with httpx.AsyncClient(timeout=25.0) as client:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            res = await client.post(send_url, json=message_payload, headers=headers)
            
            # 202 Accepted is standard Microsoft Graph sendMail success
            if res.status_code not in (200, 202):
                error_detail = res.text
                logger.error(f"Microsoft Graph sendMail failed ({res.status_code}): {error_detail}")
                
                # Record failed audit log
                audit = EmailAuditLog(
                    agency_id=mailbox.agency_id,
                    agent_id=agent_id,
                    sender_email=mailbox.email,
                    recipient_email=recipient_email,
                    subject=subject,
                    body_preview=body_html[:300],
                    has_attachments=bool(attachments),
                    attachment_names=", ".join(attachment_names) if attachment_names else None,
                    customer_id=customer_id,
                    policy_id=policy_id,
                    status="failed",
                    error_message=error_detail[:500],
                    sent_at=datetime.now(timezone.utc)
                )
                db.add(audit)
                db.commit()
                raise ValueError(f"Failed to send email via Microsoft Graph: {error_detail}")

            # Record successful audit log
            audit = EmailAuditLog(
                agency_id=mailbox.agency_id,
                agent_id=agent_id,
                sender_email=mailbox.email,
                recipient_email=recipient_email,
                subject=subject,
                body_preview=body_html[:300],
                has_attachments=bool(attachments),
                attachment_names=", ".join(attachment_names) if attachment_names else None,
                customer_id=customer_id,
                policy_id=policy_id,
                status="sent",
                sent_at=datetime.now(timezone.utc)
            )
            db.add(audit)
            db.commit()

            return {
                "success": True,
                "message": "Email sent successfully from your connected business mailbox.",
                "sender": mailbox.email,
                "recipient": recipient_email,
                "audit_id": audit.id
            }
