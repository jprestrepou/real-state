"""
Maintenance model — work orders with lifecycle states.
"""

import enum
import uuid
from datetime import datetime, date

from sqlalchemy import (
    String, Text, Numeric, Date,
    Enum as SAEnum, DateTime, ForeignKey, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MaintenanceType(str, enum.Enum):
    CORRECTIVO = "Correctivo"
    PREVENTIVO = "Preventivo"
    MEJORA = "Mejora"


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
    created_by: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    property = relationship("Property", back_populates="maintenance_orders")

    def __repr__(self) -> str:
        return f"<MaintenanceOrder {self.title} ({self.status})>"
