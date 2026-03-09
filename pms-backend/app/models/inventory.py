"""
Inventory models — property inspections (entry/exit) with items and photos.
"""

import enum
import uuid
from datetime import datetime, date
from sqlalchemy import (
    String, Text, Integer, ForeignKey, Date, DateTime, func, Enum as SAEnum
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class InventoryType(str, enum.Enum):
    INGRESO = "Ingreso"
    SALIDA = "Salida"
    VERIFICACION = "Verificación"

class ItemCondition(str, enum.Enum):
    EXCELENTE = "Excelente"
    BUENO = "Bueno"
    REGULAR = "Regular"
    MALO = "Malo"
    NA = "No Aplica"

class PropertyInventory(Base):
    __tablename__ = "property_inventories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    property_id: Mapped[str] = mapped_column(String(36), ForeignKey("properties.id"), nullable=False, index=True)
    contract_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("contracts.id"), nullable=True)
    inventory_type: Mapped[str] = mapped_column(SAEnum(InventoryType, values_callable=lambda e: [x.value for x in e]), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    property = relationship("Property")
    contract = relationship("Contract")
    creator = relationship("User")
    items = relationship("InventoryItem", back_populates="inventory", cascade="all, delete-orphan")

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    inventory_id: Mapped[str] = mapped_column(String(36), ForeignKey("property_inventories.id"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False) # e.g., Baño, Cocina
    item_name: Mapped[str] = mapped_column(String(200), nullable=False) # e.g., Lavamanos
    condition: Mapped[str] = mapped_column(SAEnum(ItemCondition, values_callable=lambda e: [x.value for x in e]), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    inventory = relationship("PropertyInventory", back_populates="items")
    photos = relationship("InventoryPhoto", back_populates="item", cascade="all, delete-orphan")

class InventoryPhoto(Base):
    __tablename__ = "inventory_photos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    inventory_item_id: Mapped[str] = mapped_column(String(36), ForeignKey("inventory_items.id"), nullable=False, index=True)
    photo_path: Mapped[str] = mapped_column(String(500), nullable=False)
    caption: Mapped[str | None] = mapped_column(String(255), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relationships
    item = relationship("InventoryItem", back_populates="photos")
