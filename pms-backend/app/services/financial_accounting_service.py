"""
Service for advanced financial accounting reports (P&L, Balance Sheet, EFE).
Grouping and monthly aggregation logic for yearly reports.
"""
from datetime import date
from collections import defaultdict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from typing import Any, Dict, List

from app.models.financial import Transaction, BankAccount, TransactionDirection, TransactionStatus, TransactionCategory
from app.services import ledger_service

# Mapping from TransactionCategory strings to report categories
CATEGORY_MAPPING = {
    "Ingresos por Arriendo": "Ingresos",
    "Otros": "Ingresos", # Can be split if needed
    "Intereses Bancarios": "Ingresos",
    
    "Gastos Mantenimiento": "Gastos Operativos",
    "Mantenimiento General": "Gastos Operativos",
    "Servicios Públicos": "Gastos Operativos",
    "Cuotas de Administración": "Gastos Operativos",
    "Impuestos y Tasas": "Gastos Operativos",
    "Seguros": "Gastos Operativos",
    "Honorarios Gestión": "Gastos Operativos",
    "Gastos Administrativos": "Gastos Operativos",
    "Gastos Generales": "Gastos Operativos",
    "Nómina y Personal": "Gastos Operativos",
    "Suministros de Oficina": "Gastos Operativos",
    "Marketing y Publicidad": "Gastos Operativos",
    "Pago de Empleados": "Gastos Operativos",
    "Pago Hipoteca": "Gastos No Operativos",
}

async def get_yearly_financial_report(db: AsyncSession, year: int) -> Dict[str, Any]:
    """
    Generates a full yearly financial report matching the P&L + Balance Sheet structure.
    """
    # 1. Fetch all transactions for the year
    stmt = select(Transaction).where(
        extract('year', Transaction.transaction_date) == year,
        Transaction.status == TransactionStatus.COMPLETADA.value,
        Transaction.category != TransactionCategory.TRANSFERENCIA_INTERNA.value
    ).order_by(Transaction.transaction_date)
    
    result = await db.execute(stmt)
    transactions = result.scalars().all()
    
    # 2. Initialize Month Containers (1-12)
    # Structure: report[section][category][month] = amount
    report = {
        "pnl": {
            "Ingresos": [0.0] * 13,
            "Costo de Ventas": [0.0] * 13,
            "Gastos Operativos": [0.0] * 13,
            "Gastos No Operativos": [0.0] * 13,
        },
        "balance": {
            "Activos (Caja/Bancos)": [0.0] * 13,
            "Pasivos/Deuda": [0.0] * 13,
        }
    }
    
    # 3. Aggregate P&L
    for tx in transactions:
        month = tx.transaction_date.month
        amount = float(tx.amount)
        
        # Determine accounting group
        group = CATEGORY_MAPPING.get(tx.category, "Otros Gastos")
        
        if tx.direction == TransactionDirection.DEBIT.value: # Ingreso
            if group == "Ingresos":
                report["pnl"]["Ingresos"][month] += amount
            else:
                # If it's a debit but assigned to a gastro group, it's a "reverse" expense or credit
                # We'll just put it in Ingresos for simplicity or Otros
                report["pnl"]["Ingresos"][month] += amount
        else: # Egreso
            if group in report["pnl"]:
                report["pnl"][group][month] += amount
            else:
                report["pnl"]["Gastos Operativos"][month] += amount

    # 4. Calculate Subtotals (EBITDA, Utility)
    report["pnl"]["Utilidad Bruta"] = [0.0] * 13
    report["pnl"]["Utilidad Operacional"] = [0.0] * 13
    report["pnl"]["Utilidad Neta"] = [0.0] * 13
    
    for m in range(1, 13):
        ing = report["pnl"]["Ingresos"][m]
        cost = report["pnl"]["Costo de Ventas"][m]
        g_op = report["pnl"]["Gastos Operativos"][m]
        g_no = report["pnl"]["Gastos No Operativos"][m]
        
        ub = ing - cost
        uo = ub - g_op
        un = uo - g_no
        
        report["pnl"]["Utilidad Bruta"][m] = ub
        report["pnl"]["Utilidad Operacional"][m] = uo
        report["pnl"]["Utilidad Neta"][m] = un
        
        # Consolidated (Month 0 is used for yearly total in this logic)
        for key in ["Ingresos", "Costo de Ventas", "Gastos Operativos", "Gastos No Operativos"]:
            report["pnl"][key][0] += report["pnl"][key][m]
            
    # Calculate consolidated totals for utilites
    report["pnl"]["Utilidad Bruta"][0] = report["pnl"]["Ingresos"][0] - report["pnl"]["Costo de Ventas"][0]
    report["pnl"]["Utilidad Operacional"][0] = report["pnl"]["Utilidad Bruta"][0] - report["pnl"]["Gastos Operativos"][0]
    report["pnl"]["Utilidad Neta"][0] = report["pnl"]["Utilidad Operacional"][0] - report["pnl"]["Gastos No Operativos"][0]

    # 5. Calculate Balance Sheet snapshots
    # We need the asset balance at the end of each month.
    # Start with total initial balance of all accounts.
    acc_stmt = select(BankAccount).where(BankAccount.is_active == True)
    acc_result = await db.execute(acc_stmt)
    accounts = acc_result.scalars().all()
    
    total_initial_balance = sum(float(a.initial_balance) for a in accounts)
    
    # We also need transactions BEFORE the target year to get the starting point of the year
    # Simplest way:
    inc_before = await db.execute(select(func.sum(Transaction.amount)).where(
        Transaction.transaction_date < date(year, 1, 1),
        Transaction.direction == TransactionDirection.DEBIT.value,
        Transaction.status == TransactionStatus.COMPLETADA.value
    ))
    exp_before = await db.execute(select(func.sum(Transaction.amount)).where(
        Transaction.transaction_date < date(year, 1, 1),
        Transaction.direction == TransactionDirection.CREDIT.value,
        Transaction.status == TransactionStatus.COMPLETADA.value
    ))
    
    balance_at_start_of_year = total_initial_balance + float(inc_before.scalar() or 0) - float(exp_before.scalar() or 0)
    
    current_asset_balance = balance_at_start_of_year
    for m in range(1, 13):
        # Change in month = Income - Expenses
        change = report["pnl"]["Ingresos"][m] - (report["pnl"]["Costo de Ventas"][m] + report["pnl"]["Gastos Operativos"][m] + report["pnl"]["Gastos No Operativos"][m])
        current_asset_balance += change
        report["balance"]["Activos (Caja/Bancos)"][m] = current_asset_balance
        
        # "Logic: for financial statement to be 0, create debt"
        # In a simple system, Equity = Assets. If there's a discrepancy, we can show it.
        # Here we'll just show Assets as the principal component.
        report["balance"]["Pasivos/Deuda"][m] = 0 # Future implementation: extract real liabilities if added
        
    report["balance"]["Activos (Caja/Bancos)"][0] = current_asset_balance # Year end balance
    
    return {
        "year": year,
        "report": report
    }
