"""
Email Service using standard smtplib and email.message.
"""
import smtplib
from email.message import EmailMessage
import logging
from typing import Optional, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from app.services import config_service

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    async def send_email(db: AsyncSession, to_email: str, subject: str, body: str, html_body: Optional[str] = None, attachment_path: Optional[str] = None):
        """Send an email using dynamic SMTP settings from DB or ENV."""
        smtp_conf = await config_service.get_smtp_config(db)
        
        host = smtp_conf["host"]
        port = smtp_conf["port"]
        user = smtp_conf["user"]
        password = smtp_conf["pass"]

        if not host or host == "smtp.example.com":
            logger.info(f"Email mock send to {to_email}. Subject: {subject}")
            return True, "Mock send"

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
                ctype_info = mimetypes.guess_type(attachment_path)
                ctype = ctype_info[0]
                encoding = ctype_info[1]
                
                if ctype is None or encoding is not None:
                    ctype = 'application/octet-stream'
                
                parts = ctype.split('/')
                maintype = parts[0]
                subtype = parts[1] if len(parts) > 1 else 'octet-stream'
                
                with open(attachment_path, 'rb') as f:
                    msg.add_attachment(f.read(), maintype=maintype, subtype=subtype, filename=os.path.basename(attachment_path))
            except Exception as e:
                logger.error(f"Failed to attach file {attachment_path}: {str(e)}")

        try:
            import asyncio
            import socket

            def _sync_send():
                # Attempt to connect using the host as-is
                try:
                    if port == 465:
                        with smtplib.SMTP_SSL(host, port, timeout=15) as server:
                            server.login(user, password)
                            server.send_message(msg)
                    else:
                        with smtplib.SMTP(host, port, timeout=15) as server:
                            server.ehlo()
                            server.starttls()
                            server.ehlo()
                            server.login(user, password)
                            server.send_message(msg)
                except (OSError, smtplib.SMTPConnectError) as e:
                    # Fallback: Try forcing IPv4 if the default attempt fails with a network/connection error
                    logger.warning(f"Default connection to {host}:{port} failed ({e}). Attempting IPv4 fallback.")
                    try:
                        addr_info = socket.getaddrinfo(host, port, family=socket.AF_INET)
                        if not addr_info:
                            raise e
                        ipv4_host = addr_info[0][4][0]
                        
                        if port == 465:
                            with smtplib.SMTP_SSL(ipv4_host, port, timeout=15) as server:
                                server.login(user, password)
                                server.send_message(msg)
                        else:
                            with smtplib.SMTP(ipv4_host, port, timeout=15) as server:
                                server.ehlo()
                                server.starttls()
                                server.ehlo()
                                server.login(user, password)
                                server.send_message(msg)
                    except Exception as e2:
                        logger.error(f"IPv4 fallback also failed: {e2}")
                        raise e  # Raise the original error for better context
            
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, _sync_send)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True, "Success"
        except Exception as e:
            err_msg = f"{type(e).__name__}: {str(e)}"
            if "101" in err_msg or "unreachable" in err_msg.lower():
                err_msg += " (Probable bloqueo de red en el servidor. Verifique puertos 587/465 en Render/Hosting)"
            logger.error(f"Error sending email to {to_email}: {err_msg}")
            return False, err_msg


    @staticmethod
    async def test_connection(db: AsyncSession) -> dict:
        """
        Test SMTP connection using current configuration.
        Returns {"success": bool, "message": str}
        """
        smtp_conf = await config_service.get_smtp_config(db)
        
        host = smtp_conf["host"]
        port = smtp_conf["port"]
        user = smtp_conf["user"]
        password = smtp_conf["pass"]

        if not host or host == "smtp.example.com":
            return {"success": False, "message": "No se ha configurado un servidor SMTP. Configure los parámetros primero."}

        if not user or not password:
            return {"success": False, "message": "Falta el usuario o la contraseña SMTP."}

        try:
            import asyncio
            import socket

            def _sync_test():
                try:
                    if port == 465:
                        with smtplib.SMTP_SSL(host, port, timeout=10) as server:
                            server.login(user, password)
                            server.noop()
                    else:
                        with smtplib.SMTP(host, port, timeout=10) as server:
                            server.ehlo()
                            server.starttls()
                            server.ehlo()
                            server.login(user, password)
                            server.noop()
                except (OSError, smtplib.SMTPConnectError) as e:
                    # IPv4 Fallback for test connection
                    try:
                        addr_info = socket.getaddrinfo(host, port, family=socket.AF_INET)
                        if not addr_info:
                            raise e
                        ipv4_host = addr_info[0][4][0]
                        if port == 465:
                            with smtplib.SMTP_SSL(ipv4_host, port, timeout=10) as server:
                                server.login(user, password)
                                server.noop()
                        else:
                            with smtplib.SMTP(ipv4_host, port, timeout=10) as server:
                                server.ehlo()
                                server.starttls()
                                server.ehlo()
                                server.login(user, password)
                                server.noop()
                    except Exception:
                        raise e
            
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, _sync_test)

            
            return {"success": True, "message": f"Conexión exitosa a {host}:{port} como {user}"}
        except smtplib.SMTPAuthenticationError:
            return {"success": False, "message": "Error de autenticación. Verifique el usuario y la contraseña."}
        except smtplib.SMTPConnectError:
            return {"success": False, "message": f"No se pudo conectar al servidor {host}:{port}. Verifique host y puerto."}
        except TimeoutError:
            return {"success": False, "message": f"Tiempo de espera agotado al conectar a {host}:{port}."}
        except Exception as e:
            return {"success": False, "message": f"Error: {str(e)}"}

    @staticmethod
    async def send_test_email(db: AsyncSession, recipient: str) -> dict:
        """
        Sends a test email to verify the full pipeline works.
        Returns {"success": bool, "message": str}
        """
        success, error_msg = await EmailService.send_email(
            db=db,
            to_email=recipient,
            subject="✅ Prueba de correo - PMS",
            body="Este es un correo de prueba para verificar la configuración SMTP del sistema PMS.",
            html_body="""
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0 0 10px 0;">✅ Configuración Exitosa</h1>
                    <p style="margin: 0; opacity: 0.9;">Property Management System</p>
                </div>
                <div style="padding: 20px; text-align: center; color: #333;">
                    <p>Este correo confirma que la configuración SMTP del sistema funciona correctamente.</p>
                    <p style="color: #999; font-size: 12px;">Correo de prueba generado automáticamente.</p>
                </div>
            </div>
            """,
        )
        if success:
            return {"success": True, "message": f"Correo de prueba enviado exitosamente a {recipient}"}
        else:
            return {"success": False, "message": f"Error detallado: {error_msg}"}
