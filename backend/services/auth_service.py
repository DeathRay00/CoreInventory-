import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user import User
from schemas.user import UserCreate
from auth.hashing import hash_password, verify_password
from auth.jwt import create_access_token
from utils.helpers import generate_otp, store_otp, verify_otp
from fastapi import HTTPException, status, BackgroundTasks


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
    # Always return success to avoid user enumeration
    if user:
        otp = generate_otp()
        store_otp(email, otp)
        # In production: background_tasks.add_task(send_reset_email, email, otp)
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
