"""
Router for advanced financial accounting reports.
"""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any

from app.database import get_db
from app.services import financial_accounting_service
from app.utils.security import get_current_user
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


@router.get("/available-years")
async def get_available_years(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[int]:
    """
    Get a list of years that have transactions.
    """
    if current_user.role not in ["Admin", "Gestor"]:
        raise HTTPException(status_code=403, detail="No tiene permisos para ver reportes financieros")
    
    return await financial_accounting_service.get_available_years(db)


@router.get("/profitability/{account_id}")
async def get_account_profitability(
    account_id: str,
    year: int = date.today().year,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get profitability metrics for a specific bank account and year.
    """
    if current_user.role not in ["Admin", "Gestor"]:
        raise HTTPException(status_code=403, detail="No tiene permisos")
    
    return await financial_accounting_service.get_account_profitability(db, account_id, year)
