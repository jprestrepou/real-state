"""
Notification model — in-app alerts for vencimientos, presupuestos, etc.
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    String, Text, Boolean,
    Enum as SAEnum, DateTime, ForeignKey, func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class NotificationLevel(str, enum.Enum):
    INFO = "Info"
    WARNING = "Warning"
    CRITICAL = "Critical"


class NotificationType(str, enum.Enum):
    VENCIMIENTO = "Vencimiento"
    PRESUPUESTO = "Presupuesto"
    CONTRATO = "Contrato"
    PAGO = "Pago"
    MANTENIMIENTO = "Mantenimiento"
    SISTEMA = "Sistema"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    notification_type: Mapped[str] = mapped_column(
        SAEnum(NotificationType, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
    )
    level: Mapped[str] = mapped_column(
        SAEnum(NotificationLevel, values_callable=lambda e: [x.value for x in e]),
        default=NotificationLevel.INFO.value,
    )
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    reference_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    reference_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def __repr__(self) -> str:
        return f"<Notification {self.title} ({self.level})>"
