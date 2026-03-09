"""
Work Group Service — manage work groups, members, and properties assignments.
"""
from typing import List, Optional
from datetime import datetime
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.work_group import WorkGroup, WorkGroupMember, WorkGroupProperty, WorkGroupRole
from app.models.user import User
from app.models.property import Property


async def create_work_group(db: AsyncSession, name: str, description: str, super_admin_id: str) -> WorkGroup:
    group = WorkGroup(name=name, description=description, super_admin_id=super_admin_id)
    db.add(group)
    await db.commit()
    await db.refresh(group)
    
    # Assign the super_admin as a member with SUPER_ADMIN role
    member = WorkGroupMember(work_group_id=group.id, user_id=super_admin_id, role=WorkGroupRole.SUPER_ADMIN.value)
    db.add(member)
    await db.commit()
    return group


async def list_work_groups(db: AsyncSession, user_id: str) -> List[WorkGroup]:
    # Users can see work groups they belong to
    stmt = select(WorkGroup).join(WorkGroupMember).filter(WorkGroupMember.user_id == user_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_work_group(db: AsyncSession, group_id: str) -> Optional[WorkGroup]:
    stmt = select(WorkGroup).options(
        selectinload(WorkGroup.members).selectinload(WorkGroupMember.user),
        selectinload(WorkGroup.properties).selectinload(WorkGroupProperty.property)
    ).filter(WorkGroup.id == group_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def add_member_to_group(db: AsyncSession, group_id: str, user_id: str, role: WorkGroupRole) -> WorkGroupMember:
    # Check if duplicate
    stmt = select(WorkGroupMember).filter_by(work_group_id=group_id, user_id=user_id)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    
    if existing:
        existing.role = role.value
        await db.commit()
        await db.refresh(existing)
        return existing
        
    member = WorkGroupMember(work_group_id=group_id, user_id=user_id, role=role.value)
    db.add(member)
    # Update user's main work_group_id
    user_stmt = select(User).filter_by(id=user_id)
    u_result = await db.execute(user_stmt)
    user = u_result.scalar_one_or_none()
    if user:
        user.work_group_id = group_id
    
    await db.commit()
    await db.refresh(member)
    return member


async def remove_member_from_group(db: AsyncSession, group_id: str, user_id: str) -> bool:
    stmt = delete(WorkGroupMember).where(
        (WorkGroupMember.work_group_id == group_id) & (WorkGroupMember.user_id == user_id)
    )
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount > 0


async def list_group_members(db: AsyncSession, group_id: str) -> List[WorkGroupMember]:
    stmt = select(WorkGroupMember).options(selectinload(WorkGroupMember.user)).filter_by(work_group_id=group_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def add_property_to_group(db: AsyncSession, group_id: str, property_id: str) -> WorkGroupProperty:
    stmt = select(WorkGroupProperty).filter_by(work_group_id=group_id, property_id=property_id)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise ValueError("Property already assigned to this group")
        
    relation = WorkGroupProperty(work_group_id=group_id, property_id=property_id)
    db.add(relation)
    await db.commit()
    await db.refresh(relation)
    return relation


async def remove_property_from_group(db: AsyncSession, group_id: str, property_id: str) -> bool:
    stmt = delete(WorkGroupProperty).where(
        (WorkGroupProperty.work_group_id == group_id) & (WorkGroupProperty.property_id == property_id)
    )
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount > 0


async def list_group_properties(db: AsyncSession, group_id: str) -> List[Property]:
    stmt = select(Property).join(WorkGroupProperty).filter(WorkGroupProperty.work_group_id == group_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())
