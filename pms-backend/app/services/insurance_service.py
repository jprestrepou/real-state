from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.models.insurance import InsurancePolicy
from app.schemas.insurance import InsurancePolicyCreate, InsurancePolicyUpdate, RiskScoreRequest, RiskScoreResponse

async def list_policies(db: AsyncSession, contract_id: str | None = None) -> list[InsurancePolicy]:
    stmt = select(InsurancePolicy)
    if contract_id:
        stmt = stmt.where(InsurancePolicy.contract_id == contract_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())

async def get_policy(db: AsyncSession, policy_id: str) -> InsurancePolicy:
    stmt = select(InsurancePolicy).where(InsurancePolicy.id == policy_id)
    result = await db.execute(stmt)
    policy = result.scalar_one_or_none()
    if not policy:
        raise HTTPException(status_code=404, detail="Póliza no encontrada")
    return policy

async def create_policy(db: AsyncSession, data: InsurancePolicyCreate) -> InsurancePolicy:
    policy = InsurancePolicy(**data.model_dump())
    db.add(policy)
    await db.commit()
    await db.refresh(policy)
    return policy

async def update_policy(db: AsyncSession, policy_id: str, data: InsurancePolicyUpdate) -> InsurancePolicy:
    policy = await get_policy(db, policy_id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(policy, key, value)
    await db.commit()
    await db.refresh(policy)
    return policy

async def delete_policy(db: AsyncSession, policy_id: str) -> bool:
    policy = await get_policy(db, policy_id)
    await db.delete(policy)
    await db.commit()
    return True

def calculate_risk_score(data: RiskScoreRequest) -> RiskScoreResponse:
    """
    Calculate a basic simulated Risk Score based on income vs rent and credit score.
    Higher score means higher risk (0-100 scale).
    """
    ratio = data.monthly_rent / data.monthly_income if data.monthly_income > 0 else 1.0
    
    # Base risk purely from ratio
    if ratio > 0.5:
        base_risk = 85.0
    elif ratio > 0.4:
        base_risk = 65.0
    elif ratio > 0.3:
        base_risk = 40.0
    else:
        base_risk = 15.0
        
    # Adjust by credit score if available (simulated)
    # Credit score usually 300 to 850
    if data.credit_score:
        if data.credit_score >= 750:
            base_risk -= 15.0
        elif data.credit_score < 600:
            base_risk += 20.0
            
    # Clamp between 0 and 100
    risk_score = max(0.0, min(100.0, base_risk))
    
    if risk_score > 60:
        level = "Alto Riesgo"
        rec = "Rechazar o requerir co-deudor solidario obligatoriamente."
    elif risk_score > 35:
        level = "Riesgo Medio"
        rec = "Aprobar con precauciones (ej: mayor depósito, verificar empresa)."
    else:
        level = "Bajo Riesgo"
        rec = "Aprobar."
        
    return RiskScoreResponse(
        risk_score=float(round(risk_score, 1)),
        risk_level=level,
        debt_to_income_ratio=float(round(ratio, 2)),
        recommendation=rec
    )
