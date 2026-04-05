"""
Global Projects service — business logic for global project visualization and conversion.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.budget_project import BudgetProject
from app.models.maintenance import MaintenanceOrder, MaintenanceType, MaintenancePriority
from app.models.budget import Budget


async def list_all_projects(db: AsyncSession) -> list[BudgetProject]:
    """List all projects across the system for Facility Management visualization."""
    stmt = (
        select(BudgetProject)
        .options(selectinload(BudgetProject.quotes))
        .order_by(BudgetProject.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def convert_to_maintenance(db: AsyncSession, project_id: str, user_id: str) -> MaintenanceOrder:
    """
    Creates a new MaintenanceOrder initialized with the BudgetProject's details.
    """
    stmt = select(BudgetProject).where(BudgetProject.id == project_id).options(selectinload(BudgetProject.quotes))
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
        
    if not project.property_id:
        raise HTTPException(status_code=400, detail="El proyecto debe tener una propiedad asignada para crear OT")

    # Map priority
    priority_map = {
        "Urgente": MaintenancePriority.URGENTE.value,
        "Alta": MaintenancePriority.ALTA.value,
        "Media": MaintenancePriority.MEDIA.value,
        "Baja": MaintenancePriority.BAJA.value
    }
    mnt_priority = priority_map.get(project.priority, MaintenancePriority.MEDIA.value)
    
    # Map type
    type_map = {
        "Mantenimiento": MaintenanceType.CORRECTIVO.value, # Default for ordinary maintenance
        "Mejora": MaintenanceType.MEJORA.value,
        "Remodelación": MaintenanceType.MEJORA.value,
        "Otro": MaintenanceType.PREVENTIVO.value
    }
    mnt_type = type_map.get(project.project_type, MaintenanceType.MEJORA.value)

    # Determine supplier details from approved quote
    supplier_name = None
    supplier_id = None
    if project.approved_quote_id:
        for q in project.quotes:
            if q.id == project.approved_quote_id:
                supplier_name = q.supplier_name
                supplier_id = q.supplier_id
                break

    order = MaintenanceOrder(
        property_id=project.property_id,
        budget_project_id=project.id,
        title=f"PROYECTO: {project.title}",
        maintenance_type=mnt_type,
        priority=mnt_priority,
        estimated_cost=project.approved_cost or project.estimated_cost,
        supplier_name=supplier_name,
        supplier_id=supplier_id,
        scheduled_date=project.scheduled_start,
        notes=f"Generado a partir del proyecto de inversión original.\n{project.notes or ''}",
        created_by=user_id
    )

    db.add(order)
    
    # Ensure project status marks progression
    if project.status in ["Borrador", "Cotizando", "Aprobado"]:
        project.status = "En Ejecución"

    await db.commit()
    await db.refresh(order)
    return order
