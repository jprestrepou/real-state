"""
Scoring models — tenant risk assessment persistence.
"""

import uuid
from datetime import datetime
from sqlalchemy import String, Numeric, ForeignKey, DateTime, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class TenantScoring(Base):
    __tablename__ = "tenant_scorings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_name: Mapped[str] = mapped_column(String(200), nullable=False)
    tenant_document: Mapped[str | None] = mapped_column(String(50), nullable=True)
    property_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("properties.id"), nullable=True)
    
    score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False) # BAJO, MEDIO, ALTO
    
    # Store the input data for reference
    input_data: Mapped[dict] = mapped_column(JSON, nullable=True)
    # Store the alerts/recommendations
    alerts: Mapped[dict] = mapped_column(JSON, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)

    # Relationships
    property = relationship("Property")
    creator = relationship("User")

    def __repr__(self) -> str:
        return f"<TenantScoring {self.tenant_name} - {self.score}>"
