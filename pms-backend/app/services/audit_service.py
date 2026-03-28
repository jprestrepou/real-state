"""
Audit Log Service — immutable recording and retrieval of system actions.
"""
from typing import List, Optional, Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.audit import AuditLog
from app.schemas.audit import AuditLogCreate

async def log_action(
    db: AsyncSession,
    action: str,
    entity_type: str,
    user_id: Optional[str] = None,
    work_group_id: Optional[str] = None,
    entity_id: Optional[str] = None,
    old_value: Optional[Dict[str, Any]] = None,
    new_value: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    commit: bool = True,
) -> AuditLog:
    """Create a new immutable audit log entry."""
    audit_log = AuditLog(
        user_id=user_id,
        work_group_id=work_group_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_value=old_value,
        new_value=new_value,
        ip_address=ip_address,
    )
    db.add(audit_log)
    if commit:
        await db.commit()
        await db.refresh(audit_log)
    else:
        await db.flush()
    return audit_log


async def list_audit_logs(
    db: AsyncSession,
    work_group_id: Optional[str] = None,
    user_id: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[AuditLog]:
    """Retrieve audit logs with optional filtering."""
    stmt = select(AuditLog).order_by(AuditLog.created_at.desc())
    
    if work_group_id:
        stmt = stmt.filter(AuditLog.work_group_id == work_group_id)
    if user_id:
        stmt = stmt.filter(AuditLog.user_id == user_id)
    if entity_type:
        stmt = stmt.filter(AuditLog.entity_type == entity_type)
    if entity_id:
        stmt = stmt.filter(AuditLog.entity_id == entity_id)
        
    stmt = stmt.limit(limit).offset(offset)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_audit_log(db: AsyncSession, log_id: str) -> Optional[AuditLog]:
    stmt = select(AuditLog).filter(AuditLog.id == log_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()
