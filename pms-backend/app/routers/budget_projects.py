"""
BudgetProjects router — /api/v1/budgets/{budget_id}/projects endpoints.
"""

import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.config import settings
from app.schemas.budget_project import (
    BudgetProjectCreate, BudgetProjectUpdate, BudgetProjectResponse,
    ProjectQuoteCreate, ProjectQuoteResponse,
)
from app.services import budget_project_service
from app.utils.security import get_current_user, require_role

router = APIRouter(prefix="/budgets", tags=["Proyectos de Presupuesto"])


# ── Projects ──────────────────────────────────────────────────

@router.get("/{budget_id}/projects", response_model=list[BudgetProjectResponse])
async def list_projects(
    budget_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Listar proyectos de un presupuesto."""
    return await budget_project_service.list_projects(db, budget_id)


@router.post("/{budget_id}/projects", response_model=BudgetProjectResponse, status_code=201)
async def create_project(
    budget_id: str,
    data: BudgetProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Crear un proyecto dentro de un presupuesto."""
    return await budget_project_service.create_project(db, budget_id, data)


@router.get("/{budget_id}/projects/{project_id}", response_model=BudgetProjectResponse)
async def get_project(
    budget_id: str,
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener detalle de un proyecto."""
    return await budget_project_service.get_project(db, project_id)


@router.put("/{budget_id}/projects/{project_id}", response_model=BudgetProjectResponse)
async def update_project(
    budget_id: str,
    project_id: str,
    data: BudgetProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Actualizar un proyecto."""
    return await budget_project_service.update_project(db, project_id, data)


@router.delete("/{budget_id}/projects/{project_id}", status_code=204)
async def delete_project(
    budget_id: str,
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Eliminar un proyecto y sus cotizaciones."""
    await budget_project_service.delete_project(db, project_id)
    return None


# ── Quotes ────────────────────────────────────────────────────

@router.post(
    "/{budget_id}/projects/{project_id}/quotes",
    response_model=ProjectQuoteResponse,
    status_code=201,
)
async def add_quote(
    budget_id: str,
    project_id: str,
    data: ProjectQuoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Agregar cotización a un proyecto."""
    return await budget_project_service.add_quote(db, project_id, data)


@router.delete("/{budget_id}/projects/{project_id}/quotes/{quote_id}", status_code=204)
async def delete_quote(
    budget_id: str,
    project_id: str,
    quote_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Eliminar una cotización."""
    await budget_project_service.delete_quote(db, quote_id)
    return None


@router.post(
    "/{budget_id}/projects/{project_id}/quotes/{quote_id}/select",
    response_model=BudgetProjectResponse,
)
async def select_quote(
    budget_id: str,
    project_id: str,
    quote_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Seleccionar la cotización ganadora de un proyecto."""
    return await budget_project_service.select_quote(db, project_id, quote_id)


@router.post(
    "/{budget_id}/projects/{project_id}/quotes/{quote_id}/upload",
    response_model=ProjectQuoteResponse,
)
async def upload_quote_file(
    budget_id: str,
    project_id: str,
    quote_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
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
