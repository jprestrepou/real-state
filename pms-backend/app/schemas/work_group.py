from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.models.work_group import WorkGroupRole

class WorkGroupBase(BaseModel):
    name: str
    description: Optional[str] = None

class WorkGroupCreate(WorkGroupBase):
    super_admin_id: Optional[str] = None

class WorkGroupResponse(WorkGroupBase):
    id: str
    super_admin_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class WorkGroupMemberBase(BaseModel):
    user_id: str
    role: WorkGroupRole

class WorkGroupMemberCreate(WorkGroupMemberBase):
    pass

class WorkGroupMemberResponse(WorkGroupMemberBase):
    id: str
    work_group_id: str
    joined_at: datetime
    model_config = ConfigDict(from_attributes=True)

class WorkGroupPropertyBase(BaseModel):
    property_id: str

class WorkGroupPropertyCreate(WorkGroupPropertyBase):
    pass

class WorkGroupPropertyResponse(WorkGroupPropertyBase):
    id: str
    work_group_id: str
    added_at: datetime
    model_config = ConfigDict(from_attributes=True)
