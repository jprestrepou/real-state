"""
Contract + PaymentSchedule models — lease management.
"""

import enum
import uuid
from datetime import datetime, date

from sqlalchemy import (
    String, Text, Numeric, Boolean, Date,
    Enum as SAEnum, DateTime, ForeignKey, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ContractType(str, enum.Enum):
    VIVIENDA = "Vivienda"
    COMERCIAL = "Comercial"
    GARAJE = "Garaje"


class ContractStatus(str, enum.Enum):
    BORRADOR = "Borrador"
    ACTIVO = "Activo"
    FINALIZADO = "Finalizado"
    CANCELADO = "Cancelado"


class PaymentStatus(str, enum.Enum):
    PENDIENTE = "Pendiente"
    PAGADO = "Pagado"
    VENCIDO = "Vencido"


class Contract(Base):
    __tablename__ = "contracts"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    property_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("properties.id"), nullable=False, index=True
    )
    tenant_name: Mapped[str] = mapped_column(String(200), nullable=False)
    tenant_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tenant_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    tenant_document: Mapped[str | None] = mapped_column(String(50), nullable=True)
    contract_type: Mapped[str] = mapped_column(
        SAEnum(ContractType, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
    )
    monthly_rent: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    deposit_amount: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    auto_renewal: Mapped[bool] = mapped_column(Boolean, default=False)
    annual_increment_pct: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
    status: Mapped[str] = mapped_column(
        SAEnum(ContractStatus, values_callable=lambda e: [x.value for x in e]),
        default=ContractStatus.BORRADOR.value,
    )
    pdf_file: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    property = relationship("Property", back_populates="contracts")
    payment_schedules = relationship("PaymentSchedule", back_populates="contract", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Contract {self.tenant_name} ({self.status})>"


class PaymentSchedule(Base):
    __tablename__ = "payment_schedules"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    contract_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("contracts.id"), nullable=False, index=True
    )
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    status: Mapped[str] = mapped_column(
        SAEnum(PaymentStatus, values_callable=lambda e: [x.value for x in e]),
        default=PaymentStatus.PENDIENTE.value,
    )
    transaction_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    paid_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    contract = relationship("Contract", back_populates="payment_schedules")

    def __repr__(self) -> str:
        return f"<PaymentSchedule {self.due_date} ${self.amount} ({self.status})>"
