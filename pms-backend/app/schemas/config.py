"""
Configuration Schemas — Pydantic schemas for Configuration module.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional

class ConfigBase(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    category: str = "GENERAL"

class ConfigCreate(ConfigBase):
    pass

class ConfigUpdate(BaseModel):
    value: str
    description: Optional[str] = None

class ConfigResponse(ConfigBase):
    model_config = ConfigDict(from_attributes=True)
