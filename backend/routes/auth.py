from typing import Annotated
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas.user import UserCreate, UserLogin, UserOut, TokenOut, PasswordResetRequest, PasswordResetConfirm
from services.auth_service import register_user, login_user, request_password_reset, reset_password
from auth.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


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
