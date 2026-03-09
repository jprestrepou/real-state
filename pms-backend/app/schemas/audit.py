from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Any, Dict

class AuditLogBase(BaseModel):
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    old_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    user_id: Optional[str] = None
    work_group_id: Optional[str] = None

class AuditLogResponse(AuditLogBase):
    id: str
    user_id: Optional[str] = None
    work_group_id: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
