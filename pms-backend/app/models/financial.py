"""
Financial models — BankAccount + Transaction (Ledger).
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


class AccountType(str, enum.Enum):
    CORRIENTE = "Corriente"
    AHORROS = "Ahorros"
    INVERSION = "Inversión"
    CAJA_MENOR = "Caja Menor"


class TransactionType(str, enum.Enum):
    INGRESO = "Ingreso"
    GASTO = "Gasto"
    TRANSFERENCIA = "Transferencia"
    AJUSTE = "Ajuste"
    INTERES = "Interés"
    ABONO = "Abono"
    CREDITO = "Crédito"


class TransactionDirection(str, enum.Enum):
    DEBIT = "Debit"
    CREDIT = "Credit"


class TransactionCategory(str, enum.Enum):
    ARRIENDO = "Ingresos por Arriendo"
    MANTENIMIENTO = "Gastos Mantenimiento"
    IMPUESTOS = "Impuestos y Tasas"
    ADMINISTRACION = "Cuotas de Administración"
    SERVICIOS = "Servicios Públicos"
    HONORARIOS = "Honorarios Gestión"
    SEGUROS = "Seguros"
    HIPOTECA = "Pago Hipoteca"
    INTERESES_BANCARIOS = "Intereses Bancarios"
    TRANSFERENCIA_INTERNA = "Transferencia Interna"
    OTROS = "Otros"


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    account_name: Mapped[str] = mapped_column(String(200), nullable=False)
    account_type: Mapped[str] = mapped_column(
        SAEnum(AccountType, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
    )
    bank_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    account_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="COP")
    current_balance: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<BankAccount {self.account_name} ({self.account_type})>"


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    account_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("bank_accounts.id"), nullable=False, index=True
    )
    property_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("properties.id"), nullable=False, index=True
    )
    transaction_type: Mapped[str] = mapped_column(
        SAEnum(TransactionType, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
    )
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    direction: Mapped[str] = mapped_column(
        SAEnum(TransactionDirection, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    reference_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    reference_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    invoice_file: Mapped[str | None] = mapped_column(String(500), nullable=True)
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    recorded_by: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    account = relationship("BankAccount", back_populates="transactions")
    property = relationship("Property", back_populates="transactions")

    def __repr__(self) -> str:
        return f"<Transaction {self.direction} {self.amount} ({self.category})>"
