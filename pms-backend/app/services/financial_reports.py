"""
Service for generating financial reports and exports (CSV, etc).
"""
import csv
import io
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Integer
from app.models.financial import BankAccount, Transaction, TransactionDirection
from app.models.property import Property

async def export_transactions_to_csv(db: AsyncSession, transactions: list[Transaction]) -> str:
    """
    Export a list of transactions to CSV format matching wallet_records.csv structure.
    """
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    
    # Header
    writer.writerow([
        "account", "category", "currency", "amount", "ref_currency_amount",
        "type", "payment_type", "note", "date", "transfer", "payee", "labels"
    ])
    
    # Caches using async queries
    result_acc = await db.execute(select(BankAccount))
    accounts_by_id = {acc.id: acc.account_name for acc in result_acc.scalars().all()}
    
    result_prop = await db.execute(select(Property))
    props_by_id = {p.id: p.name for p in result_prop.scalars().all()}
    
    for tx in transactions:
        acc_name = accounts_by_id.get(tx.account_id, "Unknown")
        prop_name = props_by_id.get(tx.property_id, "") if tx.property_id else ""
        
        is_transfer = str(tx.transaction_type == "Transferencia").lower()
        
        writer.writerow([
            acc_name,                  # account
            tx.category,               # category
            "COP",                     # currency
            tx.amount,                 # amount
            tx.amount,                 # ref_currency_amount
            tx.transaction_type,       # type
            "Transferencia bancaria",  # payment_type
            tx.description,            # note
            tx.transaction_date.isoformat() + "T00:00:00.000Z", # date format
            is_transfer,               # transfer
            "",                        # payee
            prop_name,                 # labels
        ])
    
    return output.getvalue()


async def get_eeff_report(db: AsyncSession, year: int, property_id: str | None = None) -> dict:
    """
    Generar reporte matricial EEFF (Estado de Resultados Mensual).
    """
    # Initialize matrix
    # Months 1 to 12
    report = {
        "year": year,
        "property_id": property_id,
        "months": {},
        "categories": set(),
        "total_income": 0,
        "total_expenses": 0,
        "utilidad_operacional": 0
    }
    
    for m in range(1, 13):
        report["months"][m] = {
            "income": 0,
            "expenses": 0,
            "utilidad_operacional": 0,
            "by_category": {}
        }
    
    stmt = select(Transaction).where(
        cast(func.strftime('%Y', Transaction.transaction_date), Integer) == year
    )
    if property_id:
        stmt = stmt.where(Transaction.property_id == property_id)
        
    result = await db.execute(stmt)
    transactions = result.scalars().all()
    
    for tx in transactions:
        m = tx.transaction_date.month
        cat = tx.category
        report["categories"].add(cat)
        
        m_data = report["months"][m]
        if cat not in m_data["by_category"]:
            m_data["by_category"][cat] = 0
            
        if tx.direction == TransactionDirection.DEBIT.value:
            # Ingreso
            m_data["income"] += tx.amount
            report["total_income"] += tx.amount
        else:
            # Gasto
            m_data["by_category"][cat] += tx.amount
            m_data["expenses"] += tx.amount
            report["total_expenses"] += tx.amount
            
        m_data["utilidad_operacional"] = m_data["income"] - m_data["expenses"]
        
    report["utilidad_operacional"] = report["total_income"] - report["total_expenses"]
    report["categories"] = list(report["categories"])
    
    return report
