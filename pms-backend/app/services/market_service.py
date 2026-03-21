"""
Market service - Integrations for Real Estate Valuation.
Currently uses a fallback model calibrated for Antioquia (Medellín, Envigado, Sabaneta, etc.),
ready to be integrated with PropIQ or similar API once credentials are provided.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.services.property_service import get_property
from typing import Dict, Any

# Mock Base Prices per m2 by City and Estrato in Antioquia (COP)
ANTIOQUIA_BASE_PRICES = {
    "Medellín": {
        1: 15000, 2: 18000, 3: 25000, 4: 35000, 5: 45000, 6: 60000
    },
    "Envigado": {
        3: 30000, 4: 40000, 5: 50000, 6: 65000
    },
    "Sabaneta": {
        3: 28000, 4: 35000, 5: 45000, 6: 55000
    },
    "Itagüí": {
        2: 20000, 3: 25000, 4: 32000, 5: 40000
    },
    "Bello": {
        2: 18000, 3: 22000, 4: 28000, 5: 35000
    }
}

DEFAULT_BASE_PRICE = 25000  # Fallback per m2

async def estimate_rental_value(db: AsyncSession, property_id: str) -> Dict[str, Any]:
    """
    Estimates the rental value of a property.
    This function simulates an API call to a market intelligence platform like PropIQ.
    """
    prop = await get_property(db, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
        
    # TODO: Here we would make an HTTP request to PropIQ API
    # Example:
    # response = httpx.post("https://api.propiq.co/v1/valuation", json={
    #    "city": prop.city, "stratum": prop.stratum, "area_m2": prop.area, "rooms": prop.rooms
    # }, headers={"Authorization": f"Bearer {settings.PROPIQ_API_KEY}"})
    # return response.json()
    
    # --- FALLBACK LOGIC FOR ANTIOQUIA ---
    city = prop.city.strip() if prop.city else "Medellín"
    stratum = prop.stratum or 3
    area = prop.area or 50.0
    
    # 1. Base price per m2
    city_prices = ANTIOQUIA_BASE_PRICES.get(city, ANTIOQUIA_BASE_PRICES["Medellín"])
    price_per_m2 = city_prices.get(stratum, DEFAULT_BASE_PRICE)
    
    base_rent = price_per_m2 * float(area)
    
    # 2. Adjustments based on amenities
    adjustment_factor = 1.0
    if prop.has_parking:
        adjustment_factor += 0.08  # +8% for parking
    if getattr(prop, 'has_elevator', False):
        adjustment_factor += 0.05  # +5% for elevator
    if getattr(prop, 'has_pool', False):
        adjustment_factor += 0.07  # +7% for pool/amenities
        
    estimated_rent_min = base_rent * adjustment_factor * 0.9  # -10% margin
    estimated_rent_max = base_rent * adjustment_factor * 1.15 # +15% margin
    estimated_rent = base_rent * adjustment_factor
    
    # Cap rate estimation (assuming annual rent / commercial value)
    estimated_cap_rate = 0.0
    if prop.commercial_value and float(prop.commercial_value) > 0:
        estimated_cap_rate = round(((estimated_rent * 12) / float(prop.commercial_value)) * 100, 2)
        
    return {
        "property_id": prop.id,
        "property_name": prop.name,
        "city": city,
        "stratum": stratum,
        "area_m2": area,
        "estimated_monthly_rent": round(estimated_rent, 0),
        "range_min": round(estimated_rent_min, 0),
        "range_max": round(estimated_rent_max, 0),
        "confidence_score": 0.85,  # Simulated confidence interval
        "estimated_cap_rate": estimated_cap_rate,
        "provider": "Sistema de Valoración Interno (Fallback Antioquia)"
    }
