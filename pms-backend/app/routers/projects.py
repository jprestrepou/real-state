"""
Projects router — /api/v1/projects endpoints.
Handles global visualization and operations for BudgetProjects from the Facility module.
"""

import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.config import settings
from app.schemas.budget_project import (
    BudgetProjectResponse, ProjectQuoteCreate, ProjectQuoteResponse,
)
from app.schemas.maintenance import MaintenanceResponse
from app.services import budget_project_service
from app.services import project_global_service
from app.utils.security import get_current_user, require_role

router = APIRouter(prefix="/projects", tags=["Proyectos de Facility"])


@router.get("", response_model=list[BudgetProjectResponse])
async def get_all_projects(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Gestor")),
):
    """Listar todos los proyectos sin importar su presupuesto padre."""
    return await project_global_service.list_all_projects(db)


@router.post(
    "/{project_id}/quotes",
    response_model=ProjectQuoteResponse,
    status_code=201,
)
async def add_project_quote(
    project_id: str,
    data: ProjectQuoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Gestor")),
):
    """Agregar cotización a un proyecto directamente."""
    return await budget_project_service.add_quote(db, project_id, data)


@router.post(
    "/{project_id}/quotes/{quote_id}/select",
    response_model=BudgetProjectResponse,
)
async def select_project_quote(
    project_id: str,
    quote_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Gestor")),
):
    """Aprobar cotización de un proyecto desde Facility."""
    return await budget_project_service.select_quote(db, project_id, quote_id)


@router.post(
    "/{project_id}/quotes/{quote_id}/upload",
    response_model=ProjectQuoteResponse,
)
async def upload_quote_file(
    project_id: str,
    quote_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Gestor")),
):
    """Subir archivo adjunto de cotización."""
    upload_dir = os.path.join(settings.UPLOAD_DIR, "quotes")
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename or "file")[1]
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(upload_dir, filename)

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    return await budget_project_service.set_quote_file(
        db, quote_id, f"/uploads/quotes/{filename}"
    )


@router.post(
    "/{project_id}/convert-to-maintenance",
    response_model=MaintenanceResponse,
    status_code=201,
)
async def convert_project_to_maintenance(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Gestor")),
):
    """Convierte un proyecto en una Orden de Mantenimiento."""
    return await project_global_service.convert_to_maintenance(db, project_id, current_user.id)
