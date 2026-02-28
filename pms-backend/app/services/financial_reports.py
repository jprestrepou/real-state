"""
Service for generating financial reports and exports (CSV, etc).
"""
import csv
import io
from datetime import date
from typing import Any

def export_transactions_to_csv(transactions: list[Any]) -> str:
    """
    Export a list of transactions to CSV format.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "ID", "Fecha", "Cuenta", "Propiedad", "Tipo", 
        "Categoría", "Monto", "Dirección", "Descripción"
    ])
    
    for tx in transactions:
        writer.writerow([
            tx.id,
            tx.transaction_date.isoformat(),
            tx.account_id,
            tx.property_id,
            tx.transaction_type,
            tx.category,
            tx.amount,
            tx.direction,
            tx.description
        ])
    
    return output.getvalue()
