"""
User model — RBAC with three roles: Admin, Propietario, Gestor.
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, Enum as SAEnum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "Admin"
    PROPIETARIO = "Propietario"
    GESTOR = "Gestor"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(
        SAEnum(UserRole, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
        default=UserRole.GESTOR.value,
    )
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    owned_properties = relationship(
        "Property", back_populates="owner", foreign_keys="Property.owner_id"
    )
    managed_properties = relationship(
        "Property", back_populates="manager", foreign_keys="Property.manager_id"
    )

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"
