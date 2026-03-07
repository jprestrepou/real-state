import enum
import uuid
from datetime import datetime, date
from sqlalchemy import String, Text, Enum as SAEnum, DateTime, ForeignKey, Date, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class AssetStatus(str, enum.Enum):
    OPERATIVO = "Operativo"
    EN_REPARACION = "En Reparación"
    FUERA_DE_SERVICIO = "Fuera de Servicio"
    DADO_DE_BAJA = "Dado de Baja"

class Asset(Base):
    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    property_id: Mapped[str] = mapped_column(String(36), ForeignKey("properties.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False) # e.g., Electrodomésticos, Climatización
    brand: Mapped[str | None] = mapped_column(String(100), nullable=True)
    model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    serial_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(SAEnum(AssetStatus, values_callable=lambda e: [x.value for x in e]), default=AssetStatus.OPERATIVO.value)
    purchase_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    warranty_expiry: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    property = relationship("Property", back_populates="assets")

    def __repr__(self) -> str:
        return f"<Asset {self.name} ({self.status})>"
