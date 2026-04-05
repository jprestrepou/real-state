"""
Work Group schemas — Pydantic v2 models.
"""
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.models.work_group import WorkGroupRole


class WorkGroupBase(BaseModel):
    name: str
    description: Optional[str] = None


class WorkGroupCreate(WorkGroupBase):
    super_admin_id: Optional[str] = None


# ── Member schemas ────────────────────────────────────────

class MemberUserInfo(BaseModel):
    """Minimal user info embedded in member responses."""
    id: str
    full_name: str
    email: str
    role: str
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
    user: Optional[MemberUserInfo] = None
    model_config = ConfigDict(from_attributes=True)


# ── Property schemas ──────────────────────────────────────

class WorkGroupPropertyBase(BaseModel):
    property_id: str


class WorkGroupPropertyCreate(WorkGroupPropertyBase):
    pass


class WorkGroupPropertyResponse(WorkGroupPropertyBase):
    id: str
    work_group_id: str
    added_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── Work Group response ───────────────────────────────────

class WorkGroupResponse(WorkGroupBase):
    id: str
    super_admin_id: str
    created_at: datetime
    members: List[WorkGroupMemberResponse] = []
    members_count: int = 0
    properties_count: int = 0

    model_config = ConfigDict(from_attributes=True)
