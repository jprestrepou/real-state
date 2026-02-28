"""
Budget + BudgetCategory models — traffic-light budget tracking.
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    String, Text, Numeric, Integer,
    Enum as SAEnum, DateTime, ForeignKey, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BudgetSemaphore(str, enum.Enum):
    VERDE = "Verde"
    AMARILLO = "Amarillo"
    ROJO = "Rojo"


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    property_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("properties.id"), nullable=False, index=True
    )
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    total_budget: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    total_executed: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    property_rel = relationship("Property", back_populates="budgets")
    categories = relationship("BudgetCategory", back_populates="budget", cascade="all, delete-orphan")

    @property
    def execution_pct(self) -> float:
        if self.total_budget and float(self.total_budget) > 0:
            return round(float(self.total_executed) / float(self.total_budget) * 100, 2)
        return 0.0

    @property
    def semaphore(self) -> str:
        pct = self.execution_pct
        if pct <= 85:
            return BudgetSemaphore.VERDE.value
        elif pct <= 100:
            return BudgetSemaphore.AMARILLO.value
        else:
            return BudgetSemaphore.ROJO.value

    def __repr__(self) -> str:
        return f"<Budget {self.year} {self.semaphore}>"


class BudgetCategory(Base):
    __tablename__ = "budget_categories"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    budget_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("budgets.id"), nullable=False, index=True
    )
    category_name: Mapped[str] = mapped_column(String(100), nullable=False)
    budgeted_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    executed_amount: Mapped[float] = mapped_column(Numeric(15, 2), default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    budget = relationship("Budget", back_populates="categories")

    @property
    def execution_pct(self) -> float:
        if self.budgeted_amount and float(self.budgeted_amount) > 0:
            return round(float(self.executed_amount) / float(self.budgeted_amount) * 100, 2)
        return 0.0

    @property
    def semaphore(self) -> str:
        pct = self.execution_pct
        if pct <= 85:
            return BudgetSemaphore.VERDE.value
        elif pct <= 100:
            return BudgetSemaphore.AMARILLO.value
        else:
            return BudgetSemaphore.ROJO.value

    def __repr__(self) -> str:
        return f"<BudgetCategory {self.category_name} {self.semaphore}>"
