"""
Maintenance model — work orders with lifecycle states.
"""

import enum
import uuid
from datetime import datetime, date

from sqlalchemy import (
    String, Text, Numeric, Date, Boolean,
    Enum as SAEnum, DateTime, ForeignKey, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MaintenanceType(str, enum.Enum):
    CORRECTIVO = "Correctivo"
    PREVENTIVO = "Preventivo"
    MEJORA = "Mejora"


class MaintenanceSource(str, enum.Enum):
    MANUAL = "Manual"
    TELEGRAM = "Telegram"


class MaintenanceStatus(str, enum.Enum):
    PENDIENTE = "Pendiente"
    EN_PROGRESO = "En Progreso"
    ESPERANDO_FACTURA = "Esperando Factura"
    COMPLETADO = "Completado"
    CANCELADO = "Cancelado"


class MaintenancePriority(str, enum.Enum):
    URGENTE = "Urgente"
    ALTA = "Alta"
    MEDIA = "Media"
    BAJA = "Baja"


class MaintenanceOrder(Base):
    __tablename__ = "maintenance_orders"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    property_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("properties.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    maintenance_type: Mapped[str] = mapped_column(
        SAEnum(MaintenanceType, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        SAEnum(MaintenanceStatus, values_callable=lambda e: [x.value for x in e]),
        default=MaintenanceStatus.PENDIENTE.value,
    )
    priority: Mapped[str] = mapped_column(
        SAEnum(MaintenancePriority, values_callable=lambda e: [x.value for x in e]),
        default=MaintenancePriority.MEDIA.value,
    )
    estimated_cost: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    actual_cost: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    supplier_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    scheduled_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    completed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    invoice_file: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True
    )
    source: Mapped[str] = mapped_column(
        SAEnum(MaintenanceSource, values_callable=lambda e: [x.value for x in e]),
        default=MaintenanceSource.MANUAL.value,
    )
    telegram_chat_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    telegram_message_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    supplier_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("contacts.id"), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    property = relationship("Property", back_populates="maintenance_orders")
    photos = relationship("MaintenancePhoto", back_populates="order", cascade="all, delete-orphan")
    supplier = relationship("Contact", lazy="selectin")

    def __repr__(self) -> str:
        return f"<MaintenanceOrder {self.title} ({self.status})>"


class MaintenancePhoto(Base):
    __tablename__ = "maintenance_photos"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    order_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("maintenance_orders.id"), nullable=False, index=True
    )
    photo_path: Mapped[str] = mapped_column(String(500), nullable=False)
    telegram_file_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    order = relationship("MaintenanceOrder", back_populates="photos")
