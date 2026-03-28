"""
Invoice model — Accounts Receivable representation.
"""

import enum
import uuid
from datetime import date, datetime

from sqlalchemy import (
    String, Numeric, Date, Enum as SAEnum, DateTime, ForeignKey, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class InvoiceStatus(str, enum.Enum):
    PENDIENTE = "Pendiente"
    PAGADA = "Pagada"
    VENCIDA = "Vencida"
    ANULADA = "Anulada"


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    contract_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("contracts.id"), nullable=False, index=True
    )
    property_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("properties.id"), nullable=False, index=True
    )
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    status: Mapped[str] = mapped_column(
        SAEnum(InvoiceStatus, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
        default=InvoiceStatus.PENDIENTE.value
    )
    
    # Audit
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    contract = relationship("Contract", backref="invoices")
    property = relationship("Property")
    transactions = relationship("Transaction", back_populates="invoice")

    def __repr__(self) -> str:
        return f"<Invoice {self.amount} for Contract {self.contract_id[:8]}>"
