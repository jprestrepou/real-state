"""
Properties router — /api/v1/properties endpoints.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyResponse, PropertyMapItem, RentSimulationRequest, RentSimulationResponse
from app.services import property_service, market_service
from app.utils.security import get_current_user, require_role

router = APIRouter(prefix="/properties", tags=["Propiedades"])


@router.get("", response_model=dict)
async def list_properties(
    status: str | None = None,
    city: str | None = None,
    property_type: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Listar propiedades con filtros y paginación."""
    owner_id = None if current_user.role == "Admin" else current_user.id
    properties, total = await property_service.list_properties(
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
async def create_property(
    data: PropertyCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Crear nueva propiedad."""
    return await property_service.create_property(db, data, current_user.id)


@router.get("/map", response_model=list[PropertyMapItem])
async def get_map_data(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Datos GeoJSON para mapa interactivo."""
    owner_id = None if current_user.role == "Admin" else current_user.id
    return await property_service.get_map_data(db, owner_id)


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener ficha completa de una propiedad."""
    return await property_service.get_property(db, property_id)


@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: str,
    data: PropertyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Actualizar datos de una propiedad."""
    return await property_service.update_property(db, property_id, data)


@router.delete("/{property_id}", status_code=204)
async def delete_property(
    property_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("Admin", "Propietario")),
):
    """Desactivar propiedad (soft delete)."""
    await property_service.delete_property(db, property_id)


@router.post("/simulate-rent", response_model=RentSimulationResponse)
async def simulate_rent(
    data: RentSimulationRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Simular canon de arrendamiento sugerido."""
    return await property_service.calculate_rent_simulation(
        db, 
        data.property_id, 
        data.desired_margin_pct, 
        data.include_admin_fee
    )

@router.get("/{property_id}/valuation", response_model=dict)
async def get_property_valuation(
    property_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Obtener valoración de mercado (arriendo sugerido) integrando datos de zona."""
    return await market_service.estimate_rental_value(db, property_id)
