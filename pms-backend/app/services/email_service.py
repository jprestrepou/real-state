"""
Email Service using standard smtplib and email.message.
"""
import smtplib
from email.message import EmailMessage
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, body: str, html_body: str = None, attachment_path: str = None):
        """Send an email using configured SMTP settings."""
        if not settings.SMTP_HOST or settings.SMTP_HOST == "smtp.example.com":
            logger.info(f"Email mock send to {to_email}. Subject: {subject}")
            return True

        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = settings.SMTP_USER
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
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASS)
                server.send_message(msg)
            logger.info(f"Email sent successfully to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {str(e)}")
            return False

