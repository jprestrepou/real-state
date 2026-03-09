"""
Configuration Model — Store system-wide settings in the database.
"""
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
import uuid

class GlobalConfig(Base):
    __tablename__ = "global_configs"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="GENERAL")

    def __repr__(self) -> str:
        return f"<GlobalConfig(key={self.key}, category={self.category})>"
