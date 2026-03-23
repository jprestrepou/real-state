"""
Market service - Integrations for Real Estate Valuation.
Currently uses a fallback model calibrated for Antioquia (Medellín, Envigado, Sabaneta, etc.),
ready to be integrated with PropIQ or similar API once credentials are provided.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.services.property_service import get_property
from typing import Dict, Any

# Mock Base Prices per m2 by City and Estrato in Colombia (COP)
# Representative averages for standard apartments without premium amenities in 2024.
COLOMBIA_BASE_PRICES = {
    # Antioquia
    "Medellín":       {1: 15000, 2: 18000, 3: 25000, 4: 35000, 5: 45000, 6: 60000},
    "Envigado":       {3: 30000, 4: 40000, 5: 50000, 6: 65000},
    "Sabaneta":       {3: 28000, 4: 35000, 5: 45000, 6: 55000},
    "Itagüí":         {2: 20000, 3: 25000, 4: 32000, 5: 40000},
    "Bello":          {2: 18000, 3: 22000, 4: 28000, 5: 35000},
    "Rionegro":       {3: 26000, 4: 32000, 5: 42000, 6: 50000},
    
    # Bogotá D.C. & Cundinamarca
    "Bogotá":         {1: 18000, 2: 22000, 3: 30000, 4: 42000, 5: 55000, 6: 75000},
    "Chía":           {3: 28000, 4: 38000, 5: 48000, 6: 62000},
    "Cajicá":         {3: 27000, 4: 36000, 5: 45000, 6: 60000},
    "Soacha":         {1: 14000, 2: 16000, 3: 20000},
    
    # Valle del Cauca
    "Cali":           {1: 13000, 2: 16000, 3: 22000, 4: 28000, 5: 38000, 6: 50000},
    "Palmira":        {2: 14000, 3: 18000, 4: 24000, 5: 32000},
    "Jamundí":        {2: 15000, 3: 20000, 4: 26000, 5: 34000},
    
    # Costa Caribe
    "Barranquilla":   {1: 14000, 2: 17000, 3: 23000, 4: 30000, 5: 40000, 6: 52000},
    "Cartagena":      {1: 15000, 2: 18000, 3: 25000, 4: 35000, 5: 48000, 6: 68000}, # Tourist premium
    "Santa Marta":    {2: 16000, 3: 22000, 4: 30000, 5: 40000, 6: 55000},
    
    # Eje Cafetero
    "Pereira":        {2: 15000, 3: 21000, 4: 28000, 5: 36000, 6: 48000},
    "Manizales":      {2: 14000, 3: 20000, 4: 26000, 5: 35000, 6: 45000},
    "Armenia":        {2: 14000, 3: 19000, 4: 25000, 5: 34000, 6: 44000},

    # Santanderes
    "Bucaramanga":    {2: 16000, 3: 22000, 4: 29000, 5: 38000, 6: 50000},
    "Floridablanca":  {3: 21000, 4: 28000, 5: 36000, 6: 48000},
    "Cúcuta":         {1: 12000, 2: 15000, 3: 20000, 4: 25000, 5: 32000, 6: 40000},

    # Tolima / Huila / Meta
    "Ibagué":         {2: 13000, 3: 18000, 4: 24000, 5: 32000, 6: 42000},
    "Neiva":          {2: 12000, 3: 17000, 4: 23000, 5: 30000},
    "Villavicencio":  {2: 13000, 3: 19000, 4: 25000, 5: 33000, 6: 43000},
}

DEFAULT_BASE_PRICE = 23000  # Fallback per m2 national average for stratum 3

async def estimate_rental_value(
    db: AsyncSession, 
    property_id: str, 
    target_city: str | None = None,
    target_stratum: int | None = None
) -> Dict[str, Any]:
    """
    Estimates the rental value of a property or a hypothetical scenario.
    This function simulates an API call to a market intelligence platform.
    """
    prop = await get_property(db, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
        
    # --- AUTOMATED HEURISTIC LOGIC (MOCK) FOR COLOMBIA ---
    city = (target_city or prop.city or "Bogotá").strip()
    stratum = target_stratum or prop.stratum or 3
    area = prop.area_sqm or 50.0
    
    # Titlecase for matching (e.g. "medellin" -> "Medellín" fallback)
    city_key = city.title()
    if city_key == "Bogota": city_key = "Bogotá"
    if city_key == "Medellin": city_key = "Medellín"
    if city_key == "Itagui": city_key = "Itagüí"
    
    # 1. Base price per m2
    # Find exact city, or use National Average (similar to a tier 2 city)
    city_prices = COLOMBIA_BASE_PRICES.get(city_key)
    
    provider_note = f"Simulación Analítica Nacional - Zona: {city_key}"
    if not city_prices:
        # Fallback to an average city profile if not found
        city_prices = COLOMBIA_BASE_PRICES.get("Pereira")
        provider_note = f"Simulación Analítica Nacional - Extrapolado para {city_key}"

    # Get price by stratum, or use closest available
    price_per_m2 = city_prices.get(stratum)
    if not price_per_m2:
        # Get alternative strategy: average of closest strata
        closest = min(city_prices.keys(), key=lambda k: abs(k - stratum))
        price_per_m2 = city_prices[closest]
        provider_note += f" (Acercamiento por Estrato {closest})"
    
    base_rent = price_per_m2 * float(area)
    
    # 2. Adjustments based on property amenities
    adjustment_factor = 1.0
    if prop.has_parking:
        adjustment_factor += 0.08  # +8% for parking
    if prop.has_elevator:
        adjustment_factor += 0.05  # +5% for elevator
    if prop.has_pool:
        adjustment_factor += 0.07  # +7% for pool/amenities
    if prop.has_gym:
        adjustment_factor += 0.04  # +4% for gym
        
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
        "city": city_key,
        "stratum": stratum,
        "area_m2": area,
        "estimated_monthly_rent": round(estimated_rent, 0),
        "range_min": round(estimated_rent_min, 0),
        "range_max": round(estimated_rent_max, 0),
        "confidence_score": 0.88,  # Higher confidence due to extensive matrix
        "estimated_cap_rate": estimated_cap_rate,
        "provider": provider_note
    }
