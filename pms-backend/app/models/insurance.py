import enum
import uuid
from datetime import datetime, date
from sqlalchemy import String, Enum as SAEnum, Date, Numeric, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class PolicyStatus(str, enum.Enum):
    VIGENTE = "Vigente"
    VENCIDA = "Vencida"
    CANCELADA = "Cancelada"

class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_id: Mapped[str] = mapped_column(String(36), ForeignKey("contracts.id"), nullable=False, index=True)
    insurer: Mapped[str] = mapped_column(String(200), nullable=False)
    policy_number: Mapped[str] = mapped_column(String(100), nullable=False)
    coverage_amount: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(SAEnum(PolicyStatus, values_callable=lambda e: [x.value for x in e]), default=PolicyStatus.VIGENTE.value)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    contract = relationship("Contract", backref="insurance_policies")

    def __repr__(self):
        return f"<InsurancePolicy {self.policy_number} - {self.status}>"
