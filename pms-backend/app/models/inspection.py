import enum
import uuid
from datetime import datetime, date
from sqlalchemy import String, Text, Enum as SAEnum, DateTime, ForeignKey, Date, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class InspectionType(str, enum.Enum):
    PREVENTIVA = "Preventiva"
    ENTREGA = "Entrega"
    RECIBO = "Recibo"
    RUTINARIA = "Rutinaria"

class InspectionStatus(str, enum.Enum):
    PROGRAMADA = "Programada"
    REALIZADA = "Realizada"
    CANCELADA = "Cancelada"

class Inspection(Base):
    __tablename__ = "inspections"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    property_id: Mapped[str] = mapped_column(String(36), ForeignKey("properties.id"), nullable=False, index=True)
    inspection_type: Mapped[str] = mapped_column(SAEnum(InspectionType, values_callable=lambda e: [x.value for x in e]), nullable=False)
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    completed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(SAEnum(InspectionStatus, values_callable=lambda e: [x.value for x in e]), default=InspectionStatus.PROGRAMADA.value)
    inspector_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    findings: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    property = relationship("Property", back_populates="inspections")

    def __repr__(self) -> str:
        return f"<Inspection {self.inspection_type} - {self.status}>"
