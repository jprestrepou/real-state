"""
Users router — /api/v1/users endpoints.

IMPORTANT: All /me/* routes MUST be defined BEFORE /{user_id} routes,
otherwise FastAPI will match "me" as a user_id parameter.
"""

from fastapi import APIRouter, Depends, Query, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserResponseFull,
    UserUpdate,
    ProfileUpdate,
    PasswordChange,
    AdminPasswordReset,
    UserRegister,
)
from app.utils.security import get_current_user, require_role, verify_password, hash_password

router = APIRouter(prefix="/users", tags=["Usuarios"])


# ══════════════════════════════════════════════════════════════
#  Self-service /me/* endpoints (any authenticated user)
#  MUST be defined BEFORE /{user_id} to avoid route collision.
# ══════════════════════════════════════════════════════════════

@router.get("/me/profile", response_model=UserResponseFull)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    """Obtener el perfil del usuario autenticado."""
    return UserResponseFull.model_validate(current_user)


@router.patch("/me/profile", response_model=dict)
async def update_my_profile(
    data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Actualizar nombre y teléfono del usuario autenticado."""
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    await db.commit()
    await db.refresh(current_user)
    return {"message": "Perfil actualizado", "full_name": current_user.full_name, "phone": current_user.phone}


@router.post("/me/change-password", response_model=dict)
async def change_my_password(
    data: PasswordChange,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cambiar contraseña del usuario autenticado."""
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta")

    current_user.password_hash = hash_password(data.new_password)
    await db.commit()
    return {"message": "Contraseña actualizada exitosamente"}


@router.post("/me/avatar", response_model=dict)
async def upload_avatar(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Subir foto de perfil del usuario autenticado."""
    import os, shutil
    from app.config import settings

    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Formato de imagen no permitido. Use JPG, PNG o WebP.")

    if file.size and file.size > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="La imagen no puede superar 5MB.")

    avatars_dir = os.path.join(settings.UPLOAD_DIR, "avatars")
    os.makedirs(avatars_dir, exist_ok=True)

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "jpg"
    filename = f"avatar_{current_user.id}.{ext}"
    filepath = os.path.join(avatars_dir, filename)

    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    avatar_url = f"uploads/avatars/{filename}"
    current_user.avatar_url = avatar_url
    await db.commit()

    return {"message": "Avatar actualizado", "avatar_url": avatar_url}


# ══════════════════════════════════════════════════════════════
#  Admin CRUD endpoints — only accessible by Admin role
# ══════════════════════════════════════════════════════════════

@router.get("", response_model=dict)
async def list_users(
    role: str | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin")),
):
    """Listar usuarios (solo Admin)."""
    stmt = select(User)
    if role:
        stmt = stmt.where(User.role == role)
    if search:
        stmt = stmt.where(User.full_name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))

    count_stmt = select(func.count()).select_from(stmt.subquery())
    count_result = await db.execute(count_stmt)
    total = count_result.scalar() or 0

    stmt = stmt.order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(stmt)
    users = result.scalars().all()

    return {
        "items": [UserResponseFull.model_validate(u) for u in users],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.post("", response_model=UserResponseFull, status_code=201)
async def create_user(
    data: UserRegister,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin")),
):
    """Crear un nuevo usuario (solo Admin)."""
    # Verificar email único
    stmt = select(User).where(User.email == data.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
        phone=data.phone,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponseFull.model_validate(user)


@router.get("/{user_id}", response_model=UserResponseFull)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin")),
):
    """Obtener usuario por ID."""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return UserResponseFull.model_validate(user)


@router.put("/{user_id}", response_model=UserResponseFull)
async def update_user(
    user_id: str,
    data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin")),
):
    """Actualizar usuario (solo Admin)."""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return UserResponseFull.model_validate(user)


@router.post("/{user_id}/reset-password", response_model=dict)
async def admin_reset_password(
    user_id: str,
    data: AdminPasswordReset,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin")),
):
    """Resetear la contraseña de un usuario (solo Admin)."""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.password_hash = hash_password(data.new_password)
    await db.commit()
    return {"message": f"Contraseña de {user.full_name} reseteada exitosamente"}


@router.delete("/{user_id}", response_model=dict)
async def deactivate_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin")),
):
    """Desactivar un usuario (soft-delete, solo Admin)."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes desactivar tu propia cuenta")

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.is_active = False
    await db.commit()
    return {"message": f"Usuario {user.full_name} desactivado exitosamente"}
