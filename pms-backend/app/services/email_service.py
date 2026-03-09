"""
Email Service using standard smtplib and email.message.
"""
import smtplib
from email.message import EmailMessage
import logging
from app.config import settings

from sqlalchemy.ext.asyncio import AsyncSession
from app.services import config_service

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    async def send_email(db: AsyncSession, to_email: str, subject: str, body: str, html_body: str = None, attachment_path: str = None):
        """Send an email using dynamic SMTP settings from DB or ENV."""
        smtp_conf = await config_service.get_smtp_config(db)
        
        host = smtp_conf["host"]
        port = smtp_conf["port"]
        user = smtp_conf["user"]
        password = smtp_conf["pass"]

        if not host or host == "smtp.example.com":
            logger.info(f"Email mock send to {to_email}. Subject: {subject}")
            return True

        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = user
        msg['To'] = to_email
        msg.set_content(body)

        if html_body:
            msg.add_alternative(html_body, subtype='html')

        if attachment_path:
            try:
                import mimetypes
                import os
                ctype, encoding = mimetypes.guess_type(attachment_path)
                if ctype is None or encoding is not None:
                    ctype = 'application/octet-stream'
                maintype, subtype = ctype.split('/', 1)
                
                with open(attachment_path, 'rb') as f:
                    msg.add_attachment(f.read(), maintype=maintype, subtype=subtype, filename=os.path.basename(attachment_path))
            except Exception as e:
                logger.error(f"Failed to attach file {attachment_path}: {str(e)}")

        try:
            # Note: smtplib is sync. For full async we'd use aiosmtplib, 
            # but standard smtplib is fine if we are okay with blocking the thread briefly.
            # To be 100% async-safe in FastAPI, we use a loop.run_in_executor or aiosmtplib.
            import asyncio
            from functools import partial

            def _sync_send():
                with smtplib.SMTP(host, port) as server:
                    server.starttls()
                    server.login(user, password)
                    server.send_message(msg)
            
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, _sync_send)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {str(e)}")
            return False

