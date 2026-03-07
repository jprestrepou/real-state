"""
Occupants router — /api/v1/occupants endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.occupant import OccupantCreate, OccupantUpdate, OccupantResponse
from app.services import occupant_service
from app.utils.security import get_current_user, require_role

router = APIRouter(prefix="/occupants", tags=["Ocupantes"])


@router.get("", response_model=list[OccupantResponse])
def list_occupants(
    property_id: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Listar ocupantes de una propiedad."""
    return occupant_service.list_occupants(db, property_id)


@router.post("", response_model=OccupantResponse, status_code=status.HTTP_201_CREATED)
def create_occupant(
    data: OccupantCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Crear un nuevo ocupante."""
    return occupant_service.create_occupant(db, data)


@router.get("/{occupant_id}", response_model=OccupantResponse)
def get_occupant(
    occupant_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener detalle de un ocupante."""
    occupant = occupant_service.get_occupant(db, occupant_id)
    if not occupant:
        raise HTTPException(status_code=404, detail="Ocupante no encontrado")
    return occupant


@router.put("/{occupant_id}", response_model=OccupantResponse)
def update_occupant(
    occupant_id: str,
    data: OccupantUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Actualizar datos de un ocupante."""
    occupant = occupant_service.update_occupant(db, occupant_id, data)
    if not occupant:
        raise HTTPException(status_code=404, detail="Ocupante no encontrado")
    return occupant


@router.delete("/{occupant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_occupant(
    occupant_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario", "Gestor")),
):
    """Eliminar un ocupante."""
    success = occupant_service.delete_occupant(db, occupant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ocupante no encontrado")
    return None
