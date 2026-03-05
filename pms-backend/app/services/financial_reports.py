"""
Service for generating financial reports and exports (CSV, etc).
"""
import csv
import io
from datetime import date
from typing import Any
from sqlalchemy.orm import Session
from app.models.financial import BankAccount, Transaction
from app.models.property import Property

def export_transactions_to_csv(db: Session, transactions: list[Transaction]) -> str:
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
    
    # Caches
    accounts_by_id = {acc.id: acc.account_name for acc in db.query(BankAccount).all()}
    props_by_id = {p.id: p.name for p in db.query(Property).all()}
    
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
