"""
BudgetProject + ProjectQuote models — project & quotation tracking for budgets.
"""

import enum
import uuid
from datetime import datetime, date

from sqlalchemy import (
    String, Text, Numeric, Integer, Boolean, Date,
    Enum as SAEnum, DateTime, ForeignKey, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ProjectType(str, enum.Enum):
    MANTENIMIENTO = "Mantenimiento"
    MEJORA = "Mejora"
    REMODELACION = "Remodelación"
    OTRO = "Otro"


class ProjectStatus(str, enum.Enum):
    BORRADOR = "Borrador"
    COTIZANDO = "Cotizando"
    APROBADO = "Aprobado"
    EN_EJECUCION = "En Ejecución"
    COMPLETADO = "Completado"
    CANCELADO = "Cancelado"


class ProjectPriority(str, enum.Enum):
    URGENTE = "Urgente"
    ALTA = "Alta"
    MEDIA = "Media"
    BAJA = "Baja"


class BudgetProject(Base):
    __tablename__ = "budget_projects"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    budget_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("budgets.id"), nullable=False, index=True
    )
    property_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("properties.id"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    project_type: Mapped[str] = mapped_column(
        SAEnum(ProjectType, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
        default=ProjectType.MANTENIMIENTO.value,
    )
    status: Mapped[str] = mapped_column(
        SAEnum(ProjectStatus, values_callable=lambda e: [x.value for x in e]),
        default=ProjectStatus.BORRADOR.value,
    )
    priority: Mapped[str] = mapped_column(
        SAEnum(ProjectPriority, values_callable=lambda e: [x.value for x in e]),
        default=ProjectPriority.MEDIA.value,
    )
    estimated_cost: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    approved_cost: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    actual_cost: Mapped[float | None] = mapped_column(Numeric(15, 2), nullable=True)
    approved_quote_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    scheduled_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    scheduled_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    completed_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    budget = relationship("Budget", back_populates="projects")
    property_rel = relationship("Property", lazy="selectin")
    quotes = relationship(
        "ProjectQuote", back_populates="project", cascade="all, delete-orphan",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<BudgetProject {self.title} ({self.status})>"


class ProjectQuote(Base):
    __tablename__ = "project_quotes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    project_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("budget_projects.id"), nullable=False, index=True
    )
    supplier_name: Mapped[str] = mapped_column(String(200), nullable=False)
    supplier_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("contacts.id"), nullable=True
    )
    amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="COP")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    validity_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    quote_file: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_selected: Mapped[bool] = mapped_column(Boolean, default=False)
    submitted_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    project = relationship("BudgetProject", back_populates="quotes")
    supplier = relationship("Contact", lazy="selectin")

    def __repr__(self) -> str:
        return f"<ProjectQuote {self.supplier_name} ${self.amount}>"
