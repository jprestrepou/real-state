"""
Properties router — /api/v1/properties endpoints.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyResponse, PropertyMapItem
from app.services import property_service
from app.utils.security import get_current_user, require_role

router = APIRouter(prefix="/properties", tags=["Propiedades"])


@router.get("", response_model=dict)
def list_properties(
    status: str | None = None,
    city: str | None = None,
    property_type: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Listar propiedades con filtros y paginación."""
    owner_id = None if current_user.role == "Admin" else current_user.id
    properties, total = property_service.list_properties(
        db, owner_id=owner_id, status_filter=status,
        city=city, property_type=property_type, page=page, limit=limit,
    )
    return {
        "items": [PropertyResponse.model_validate(p) for p in properties],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.post("", response_model=PropertyResponse, status_code=201)
def create_property(
    data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Crear nueva propiedad."""
    return property_service.create_property(db, data, current_user.id)


@router.get("/map", response_model=list[PropertyMapItem])
def get_map_data(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Datos GeoJSON para mapa interactivo."""
    owner_id = None if current_user.role == "Admin" else current_user.id
    return property_service.get_map_data(db, owner_id)


@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(
    property_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener ficha completa de una propiedad."""
    return property_service.get_property(db, property_id)


@router.put("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: str,
    data: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Actualizar datos de una propiedad."""
    return property_service.update_property(db, property_id, data)


@router.delete("/{property_id}", status_code=204)
def delete_property(
    property_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Desactivar propiedad (soft delete)."""
    property_service.delete_property(db, property_id)
