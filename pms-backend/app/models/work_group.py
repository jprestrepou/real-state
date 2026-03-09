"""
Work Group model — collaborative groups of users sharing access to properties.
"""

from datetime import datetime
import uuid
import enum

from sqlalchemy import String, Text, DateTime, func, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class WorkGroupRole(str, enum.Enum):
    ADMIN = "Admin"
    SUPER_ADMIN = "Super Admin"
    ANALISTA = "Analista"


class WorkGroup(Base):
    __tablename__ = "work_groups"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    super_admin_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    super_admin = relationship("User", foreign_keys=[super_admin_id])
    members = relationship("WorkGroupMember", back_populates="work_group", cascade="all, delete-orphan")
    properties = relationship("WorkGroupProperty", back_populates="work_group", cascade="all, delete-orphan")
    users = relationship("User", back_populates="work_group", foreign_keys="User.work_group_id")


class WorkGroupMember(Base):
    __tablename__ = "work_group_members"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    work_group_id: Mapped[str] = mapped_column(String(36), ForeignKey("work_groups.id"), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(
        SAEnum(WorkGroupRole, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
        default=WorkGroupRole.ADMIN.value,
    )
    joined_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    work_group = relationship("WorkGroup", back_populates="members")
    user = relationship("User", back_populates="group_memberships", foreign_keys=[user_id])


class WorkGroupProperty(Base):
    __tablename__ = "work_group_properties"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    work_group_id: Mapped[str] = mapped_column(String(36), ForeignKey("work_groups.id"), nullable=False, index=True)
    property_id: Mapped[str] = mapped_column(String(36), ForeignKey("properties.id"), nullable=False, index=True)
    added_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    work_group = relationship("WorkGroup", back_populates="properties")
    property = relationship("Property", back_populates="work_group_assignments", foreign_keys=[property_id])
