"""
Contact model — For providers, clients, and tenants.
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import String, Text, Boolean, Enum as SAEnum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ContactType(str, enum.Enum):
    PROVEEDOR = "Proveedor"
    CLIENTE = "Cliente"
    ARRENDATARIO = "Arrendatario"
    OTRO = "Otro"


class Contact(Base):
    __tablename__ = "contacts"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_type: Mapped[str] = mapped_column(
        SAEnum(ContactType, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
    )
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<Contact {self.name} ({self.contact_type})>"
