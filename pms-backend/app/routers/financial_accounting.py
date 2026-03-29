"""
Router for advanced financial accounting reports.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.database import get_db
from app.services import financial_accounting_service
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter(prefix="/accounting", tags=["Accounting"])

@router.get("/yearly-report/{year}")
async def get_yearly_report(
    year: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get a full financial report (P&L, Balance Sheet) for a specific year.
    """
    # Only Admin or Manager can view these reports
    if current_user.role not in ["Admin", "Gestor"]:
        raise HTTPException(status_code=403, detail="No tiene permisos para ver reportes financieros consolidados")
    
    return await financial_accounting_service.get_yearly_financial_report(db, year)
