"""
Scoring Service — logic for tenant risk assessment.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.scoring import TenantScoring
from app.schemas.scoring import ScoringInput

async def calculate_and_save_score(db: AsyncSession, data: ScoringInput, user_id: str):
    # Core algorithm logic (previously in insurance_service.py)
    score = 0
    alerts = []

    # 1. RATIO CANON/INGRESO (max 30)
    ratio = data.monthly_rent / data.monthly_income
    if ratio <= 0.30:    score += 30
    elif ratio <= 0.35:  score += 20
    elif ratio <= 0.40:  score += 10
    else:                alerts.append("Canon supera el 40% del ingreso — RIESGO ALTO")

    # 2. TIPO DE INGRESO (max 20)
    income_scores = {
        "Empleado_Formal": 20, "Pensionado": 18,
        "Independiente": 12,   "Rentista": 10
    }
    score += income_scores.get(data.income_type, 5)

    # 3. ANTIGÜEDAD LABORAL (max 15)
    if data.employment_months >= 24:    score += 15
    elif data.employment_months >= 12:  score += 10
    elif data.employment_months >= 6:   score += 5
    else:                               alerts.append("Menos de 6 meses en empleo actual")

    # 4. CODEUDOR (max 15)
    if data.has_cosigner:  score += 15
    else:                  alerts.append("Sin codeudor — incrementa el riesgo")

    # 5. ANTECEDENTES (up to -20)
    if data.previous_evictions:
        score -= 20
        alerts.append("ALERTA: Antecedentes de lanzamiento previo")

    # 6. REPORTE DE CRÉDITO
    credit_scores = {
        "Sin_reporte": 5, "Sin_mora": 5,
        "Con_mora": -5,   "Castigado": -15
    }
    score += credit_scores.get(data.credit_report_status, 0)

    # 7. BONUS: Seguro
    if data.has_rental_insurance:  score += 5

    score = max(0, min(100, score))
    if score >= 70:    risk_level = "BAJO"
    elif score >= 50:  risk_level = "MEDIO"
    else:              risk_level = "ALTO"

    # Save to DB
    scoring = TenantScoring(
        tenant_name=data.tenant_name,
        tenant_document=data.tenant_document,
        property_id=data.property_id,
        score=float(score),
        risk_level=risk_level,
        input_data=data.model_dump(),
        alerts={"list": alerts},
        created_by=user_id
    )
    db.add(scoring)
    await db.commit()
    await db.refresh(scoring)
    
    return scoring

async def get_tenant_scorings(db: AsyncSession, tenant_name: str = None, property_id: str = None):
    stmt = select(TenantScoring)
    if tenant_name:
        stmt = stmt.where(TenantScoring.tenant_name.ilike(f"%{tenant_name}%"))
    if property_id:
        stmt = stmt.where(TenantScoring.property_id == property_id)
    
    stmt = stmt.order_by(TenantScoring.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()
