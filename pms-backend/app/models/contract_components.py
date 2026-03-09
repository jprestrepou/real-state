"""
Contract Components — models for signatures and termination letters.
"""

import uuid
from datetime import datetime, date
from sqlalchemy import String, Text, ForeignKey, DateTime, Date, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class ContractSignature(Base):
    __tablename__ = "contract_signatures"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_id: Mapped[str] = mapped_column(String(36), ForeignKey("contracts.id"), nullable=False, index=True)
    signer_name: Mapped[str] = mapped_column(String(200), nullable=False)
    signer_document: Mapped[str] = mapped_column(String(50), nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    signature_hash: Mapped[str | None] = mapped_column(String(256), nullable=True)
    signed_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    
    # Relationships
    contract = relationship("Contract", backref="signatures")

class TerminationLetter(Base):
    __tablename__ = "termination_letters"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_id: Mapped[str] = mapped_column(String(36), ForeignKey("contracts.id"), nullable=False, index=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    termination_date: Mapped[date] = mapped_column(Date, nullable=False)
    pdf_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)

    # Relationships
    contract = relationship("Contract", backref="termination_letters")
    creator = relationship("User")
