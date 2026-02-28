"""
Property model — all property types with geo-location.
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    String, Text, Integer, Numeric, Boolean,
    Enum as SAEnum, DateTime, ForeignKey, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PropertyType(str, enum.Enum):
    APARTAMENTO = "Apartamento"
    CASA = "Casa"
    LOCAL = "Local"
    BODEGA = "Bodega"
    OFICINA = "Oficina"
    LOTE = "Lote"


class PropertyStatus(str, enum.Enum):
    DISPONIBLE = "Disponible"
    ARRENDADA = "Arrendada"
    MANTENIMIENTO = "En Mantenimiento"
    VENDIDA = "Vendida"


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    owner_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    manager_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    property_type: Mapped[str] = mapped_column(
        SAEnum(PropertyType, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
    )
    address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), default="Colombia")
    latitude: Mapped[float] = mapped_column(Numeric(10, 8), nullable=False)
    longitude: Mapped[float] = mapped_column(Numeric(11, 8), nullable=False)
    area_sqm: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    bedrooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bathrooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cadastral_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    commercial_value: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    status: Mapped[str] = mapped_column(
        SAEnum(PropertyStatus, values_callable=lambda e: [x.value for x in e]),
        default=PropertyStatus.DISPONIBLE.value,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    owner = relationship("User", back_populates="owned_properties", foreign_keys=[owner_id])
    manager = relationship("User", back_populates="managed_properties", foreign_keys=[manager_id])
    transactions = relationship("Transaction", back_populates="property")
    maintenance_orders = relationship("MaintenanceOrder", back_populates="property")
    contracts = relationship("Contract", back_populates="property")
    budgets = relationship("Budget", back_populates="property_rel")

    def __repr__(self) -> str:
        return f"<Property {self.name} ({self.status})>"
