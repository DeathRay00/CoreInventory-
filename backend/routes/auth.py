from typing import Annotated
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas.user import (
    UserCreate, UserLogin, UserOut, TokenOut,
    PasswordResetRequest, PasswordResetConfirm,
    SignupRequest, SignupVerify,
)
from services.auth_service import (
    register_user, login_user, request_password_reset, reset_password,
    send_signup_otp, verify_signup_otp,
)
from auth.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup/send-otp")
async def signup_send_otp(data: SignupRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    """Step 1 — Validate & send OTP to email."""
    return await send_signup_otp(db, data)


@router.post("/signup/verify", response_model=TokenOut)
async def signup_verify(data: SignupVerify, db: Annotated[AsyncSession, Depends(get_db)]):
    """Step 2 — Verify OTP and create account. Returns JWT."""
    return await verify_signup_otp(db, data.email, data.otp)


@router.post("/register", response_model=UserOut, status_code=201)
async def register(data: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    return await register_user(db, data)


@router.post("/login", response_model=TokenOut)
async def login(data: UserLogin, db: Annotated[AsyncSession, Depends(get_db)]):
    return await login_user(db, data.email, data.password)


@router.get("/me", response_model=UserOut)
async def me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user


@router.post("/request-reset")
async def request_reset(
    data: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await request_password_reset(db, data.email, background_tasks)


@router.post("/reset-password")
async def reset_pwd(data: PasswordResetConfirm, db: Annotated[AsyncSession, Depends(get_db)]):
    return await reset_password(db, data.email, data.otp, data.new_password)
