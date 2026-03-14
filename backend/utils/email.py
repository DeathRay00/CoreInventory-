"""
Email utility — sends OTP emails via Gmail SMTP.
Configure SMTP_USER and SMTP_PASSWORD in .env
For Gmail, use an App Password (not your regular password):
  https://myaccount.google.com/apppasswords
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings


def send_otp_email(to_email: str, otp: str, purpose: str = "registration") -> bool:
    """Send an OTP email. Returns True on success, False on failure."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        # Dev fallback — print OTP to console
        print(f"📧 [DEV] OTP for {to_email}: {otp}  (SMTP not configured)")
        return True

    subject = f"CoreInventory — Your OTP for {purpose}"
    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto;
                background: #0f1320; border-radius: 16px; padding: 40px; color: #e8eaf6;">
        <h1 style="text-align: center; color: #4f8ef7; margin-bottom: 8px; font-size: 24px;">
            CoreInventory
        </h1>
        <p style="text-align: center; color: #8892b0; font-size: 13px; margin-bottom: 32px;">
            Enterprise Inventory Platform
        </p>
        <p style="font-size: 15px; color: #e8eaf6;">
            Your one-time verification code is:
        </p>
        <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; background: linear-gradient(135deg, #4f8ef7, #2563eb);
                         color: #fff; font-size: 32px; font-weight: 800; letter-spacing: 8px;
                         padding: 16px 36px; border-radius: 12px;">
                {otp}
            </span>
        </div>
        <p style="font-size: 13px; color: #8892b0;">
            This code expires in <strong style="color: #e8eaf6;">10 minutes</strong>.
            Do not share it with anyone.
        </p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 28px 0;" />
        <p style="font-size: 11px; color: #4a5578; text-align: center;">
            If you didn't request this, ignore this email.
        </p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"CoreInventory <{settings.SMTP_USER}>"
    msg["To"] = to_email
    msg.attach(MIMEText(f"Your OTP is: {otp}\nExpires in 10 minutes.", "plain"))
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"❌ Email send failed: {e}")
        # Fallback — print to console so the OTP is still usable in dev
        print(f"📧 [FALLBACK] OTP for {to_email}: {otp}")
        return False
