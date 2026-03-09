"""
Auth router — /api/v1/auth endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.user import (
    UserRegister,
    UserLogin,
    TokenResponse,
    TokenRefresh,
    UserResponse,
)
from app.services.auth_service import register_user, login_user, refresh_access_token
from app.utils.security import get_current_user

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Registrar nuevo usuario."""
    return await register_user(db, data)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Iniciar sesión — retorna access + refresh token."""
    return await login_user(db, data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: TokenRefresh, db: AsyncSession = Depends(get_db)):
    """Renovar access token con refresh token válido."""
    return await refresh_access_token(db, data)


@router.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_user)):
    """Obtener perfil del usuario autenticado."""
    return current_user
