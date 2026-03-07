"""
Occupant model — People living in a property.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PropertyOccupant(Base):
    __tablename__ = "property_occupants"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    property_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("properties.id"), nullable=False, index=True
    )
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    dni: Mapped[str | None] = mapped_column(String(50), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_primary: Mapped[bool] = mapped_column(default=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationship
    property = relationship("Property", back_populates="occupants")

    def __repr__(self) -> str:
        return f"<PropertyOccupant {self.full_name} ({self.property_id})>"
