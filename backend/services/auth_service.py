import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user import User
from schemas.user import UserCreate, SignupRequest
from auth.hashing import hash_password, verify_password
from auth.jwt import create_access_token
from utils.helpers import generate_otp, store_otp, verify_otp
from utils.email import send_otp_email
from fastapi import HTTPException, status, BackgroundTasks

# Temporary store for pending registrations: {email: {name, email, password_hash, role}}
_pending_registrations: dict[str, dict] = {}


async def send_signup_otp(db: AsyncSession, data: SignupRequest) -> dict:
    """Step 1: Validate email uniqueness, store pending registration, send OTP."""
    existing = await db.execute(select(User).where(User.email == data.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "VALIDATION_ERROR", "message": "Email already registered", "details": None},
        )
    otp = generate_otp()
    store_otp(data.email.lower(), otp)
    _pending_registrations[data.email.lower()] = {
        "name": data.name,
        "email": data.email.lower(),
        "password_hash": hash_password(data.password),
        "role": data.role,
    }
    send_otp_email(data.email, otp, "account registration")
    return {"message": "OTP sent to your email address."}


async def verify_signup_otp(db: AsyncSession, email: str, otp: str) -> dict:
    """Step 2: Verify OTP and create the user account."""
    email_lower = email.lower()
    if not verify_otp(email_lower, otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "VALIDATION_ERROR", "message": "Invalid or expired OTP", "details": None},
        )
    pending = _pending_registrations.pop(email_lower, None)
    if not pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "VALIDATION_ERROR", "message": "No pending registration found. Please sign up again.", "details": None},
        )
    # Double-check email isn't taken (race condition guard)
    existing = await db.execute(select(User).where(User.email == email_lower))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "VALIDATION_ERROR", "message": "Email already registered", "details": None},
        )
    user = User(
        name=pending["name"],
        email=pending["email"],
        password_hash=pending["password_hash"],
        role=pending["role"],
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


async def register_user(db: AsyncSession, data: UserCreate) -> User:
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "VALIDATION_ERROR", "message": "Email already registered", "details": None},
        )
    user = User(
        name=data.name,
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def login_user(db: AsyncSession, email: str, password: str) -> dict:
    result = await db.execute(select(User).where(User.email == email.lower()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Incorrect email or password", "details": None},
        )
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": user}


async def request_password_reset(db: AsyncSession, email: str, background_tasks: BackgroundTasks) -> dict:
    result = await db.execute(select(User).where(User.email == email.lower()))
    user = result.scalar_one_or_none()
    if user:
        otp = generate_otp()
        store_otp(email, otp)
        send_otp_email(email, otp, "password reset")
    return {"message": "If that email exists, a reset OTP has been sent."}


async def reset_password(db: AsyncSession, email: str, otp: str, new_password: str) -> dict:
    if not verify_otp(email, otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "VALIDATION_ERROR", "message": "Invalid or expired OTP", "details": None},
        )
    result = await db.execute(select(User).where(User.email == email.lower()))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "RESOURCE_NOT_FOUND", "message": "User not found", "details": None},
        )
    user.password_hash = hash_password(new_password)
    await db.flush()
    return {"message": "Password reset successful."}
