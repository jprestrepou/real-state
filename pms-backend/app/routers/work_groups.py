from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.work_group import (
    WorkGroupCreate, WorkGroupResponse,
    WorkGroupMemberCreate, WorkGroupMemberResponse,
    WorkGroupPropertyCreate, WorkGroupPropertyResponse
)
from app.schemas.property import PropertyResponse
from app.services import work_group_service

router = APIRouter(prefix="/work-groups", tags=["Work Groups"])


@router.post("/", response_model=WorkGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_work_group(
    data: WorkGroupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new work group. The creator is assigned as Super Admin."""
    return await work_group_service.create_work_group(
        db, name=data.name, description=data.description, super_admin_id=data.super_admin_id
    )


@router.get("/", response_model=List[WorkGroupResponse])
async def list_work_groups(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List work groups the user belongs to"""
    return await work_group_service.list_work_groups(db, current_user.id)


@router.get("/{group_id}", response_model=WorkGroupResponse)
async def get_work_group(
    group_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = await work_group_service.get_work_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Work group not found")
    return group


@router.post("/{group_id}/members", response_model=WorkGroupMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_member(
    group_id: str,
    data: WorkGroupMemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Depending on auth logic, verify current_user is super_admin or admin
    return await work_group_service.add_member_to_group(
        db, group_id=group_id, user_id=data.user_id, role=data.role
    )


@router.delete("/{group_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    group_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = await work_group_service.remove_member_from_group(db, group_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Member not found in group")
    return None


@router.post("/{group_id}/properties", response_model=WorkGroupPropertyResponse, status_code=status.HTTP_201_CREATED)
async def add_property(
    group_id: str,
    data: WorkGroupPropertyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return await work_group_service.add_property_to_group(
            db, group_id=group_id, property_id=data.property_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{group_id}/properties/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_property(
    group_id: str,
    property_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = await work_group_service.remove_property_from_group(db, group_id, property_id)
    if not success:
        raise HTTPException(status_code=404, detail="Property not found in group")
    return None


@router.get("/{group_id}/members", response_model=List[WorkGroupMemberResponse])
async def list_members(
    group_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await work_group_service.list_group_members(db, group_id)


@router.get("/{group_id}/properties", response_model=List[PropertyResponse])
async def list_properties(
    group_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await work_group_service.list_group_properties(db, group_id)
