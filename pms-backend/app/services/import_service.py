"""
Import service — CSV analysis and smart import with auto-detection.
Two-step flow: analyze → confirm & import.
"""

import io
import csv
from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from dateutil import parser as date_parser

from app.models.financial import (
    BankAccount, Transaction, TransactionDirection, TransactionType, 
    TransactionCategory, AccountType
)
from app.models.property import Property, PropertyType, PropertyStatus
from app.schemas.financial import TransactionCreate
from app.services import ledger_service


# ── Category Mapping ─────────────────────────────────────

def map_category(csv_category: str, note: str, csv_type: str) -> str:
    """
    Map a CSV category + note to a system TransactionCategory value.
    Priority: note keywords first, then csv_category keywords.
    """
    note_lower = note.lower() if note else ""
    cat_lower = csv_category.lower() if csv_category else ""

    # Note-based detection (most specific)
    if "arriendo" in note_lower:
        return TransactionCategory.ARRIENDO.value
    if "administración" in note_lower or "administracion" in note_lower:
        return TransactionCategory.ADMINISTRACION.value
    if "mantenimiento" in note_lower:
        return TransactionCategory.MANTENIMIENTO.value
    if "impuesto predial" in note_lower:
        return TransactionCategory.IMPUESTOS.value
    if "impuesto" in note_lower or "semaforización" in note_lower.replace("ó", "o"):
        return TransactionCategory.IMPUESTOS.value
    if "tasa de seguridad" in note_lower:
        return TransactionCategory.IMPUESTOS.value
    if "seguro" in note_lower or "soat" in note_lower:
        return TransactionCategory.SEGUROS.value
    if "seguridad social" in note_lower:
        return TransactionCategory.PAGO_EMPLEADOS.value
    if "rendimiento" in note_lower:
        return TransactionCategory.INTERESES_BANCARIOS.value
    if "abogado" in note_lower or "contador" in note_lower:
        return TransactionCategory.HONORARIOS.value
    if "cda" in note_lower:
        return TransactionCategory.MANTENIMIENTO.value
    if "retención" in note_lower or "retencion" in note_lower:
        return TransactionCategory.IMPUESTOS.value

    # Category-based detection
    if "empleados" in cat_lower:
        return TransactionCategory.PAGO_EMPLEADOS.value
    if "reparaciones" in cat_lower or "mantenimiento" in cat_lower:
        return TransactionCategory.MANTENIMIENTO.value
    if "intereses" in cat_lower and ("ganancias" in cat_lower or "rendimiento" in cat_lower):
        return TransactionCategory.INTERESES_BANCARIOS.value
    if "intereses" in cat_lower and ("cargos" in cat_lower or "seguros" in cat_lower):
        return TransactionCategory.SEGUROS.value
    if "impuestos" in cat_lower:
        return TransactionCategory.IMPUESTOS.value
    if "servicios" in cat_lower and csv_type.lower() == "ingreso":
        return TransactionCategory.ARRIENDO.value
    if "servicios contables" in cat_lower:
        return TransactionCategory.HONORARIOS.value
    if "transferir" in cat_lower or "retirar" in cat_lower:
        return TransactionCategory.TRANSFERENCIA_INTERNA.value
    if "gastos de viaje" in cat_lower:
        return TransactionCategory.GASTOS_GENERALES.value
    if "préstamos" in cat_lower or "prestamos" in cat_lower:
        return TransactionCategory.OTROS.value
    if "otros gastos" in cat_lower or "administrativos" in cat_lower:
        return TransactionCategory.GASTOS_ADMINISTRATIVOS.value

    return TransactionCategory.OTROS.value


def _parse_csv(file_content: str) -> list[dict]:
    """Parse CSV content and return list of row dicts. Auto-detects delimiter."""
    if not file_content.strip():
        return []
        
    # Sniff delimiter
    first_line = file_content.splitlines()[0]
    delimiter = ";" if ";" in first_line else ","
    
    reader = csv.DictReader(io.StringIO(file_content), delimiter=delimiter)
    return list(reader)


# ── Step 1: Analyze ──────────────────────────────────────

async def analyze_csv(db: AsyncSession, file_content: str) -> dict:
    """
    Analyze a CSV file and return detected accounts, labels, and stats.
    Does NOT modify the database.
    """
    rows = _parse_csv(file_content)

    # Existing data
    result_acc = await db.execute(select(BankAccount))
    existing_accounts = {
        a.account_name.lower(): a.account_name
        for a in result_acc.scalars().all()
    }
    result_prop = await db.execute(select(Property))
    existing_properties = {
        p.name.lower(): p.name
        for p in result_prop.scalars().all()
    }

    detected_accounts: dict[str, int] = {}  # name -> count
    detected_labels: dict[str, int] = {}    # label -> count
    category_mapping: dict[str, str] = {}   # csv_category -> mapped_category
    total_rows = 0
    transfers_skipped = 0
    skipped_empty = 0

    for row in rows:
        account_name = row.get("account", "").strip()
        if not account_name:
            skipped_empty += 1
            continue

        is_transfer = row.get("transfer", "").strip().lower() == "true"
        if is_transfer:
            transfers_skipped += 1
            # We used to continue here, but that misses account detection and correct row totals.
            # We will now process them as normal movements.

        total_rows += 1

        # Track accounts
        if account_name not in detected_accounts:
            detected_accounts[account_name] = 0
        detected_accounts[account_name] += 1

        # Track labels
        label = row.get("labels", "").strip()
        if label:
            if label not in detected_labels:
                detected_labels[label] = 0
            detected_labels[label] += 1

        # Track category mappings
        csv_cat = row.get("category", "").strip()
        note = row.get("note", "").strip()
        csv_type = row.get("type", "").strip()
        if csv_cat and csv_cat not in category_mapping:
            category_mapping[csv_cat] = map_category(csv_cat, note, csv_type)

    # Classify accounts
    new_accounts = []
    known_accounts = []
    for name, count in detected_accounts.items():
        info = {"name": name, "transaction_count": count}
        if name.lower() in existing_accounts:
            info["name"] = existing_accounts[name.lower()]  # Use canonical name
            known_accounts.append(info)
        else:
            new_accounts.append(info)

    # Classify labels
    labels_info = []
    for label, count in detected_labels.items():
        labels_info.append({
            "label": label,
            "transaction_count": count,
            "already_exists": label.lower() in existing_properties,
            "suggested_apartment": _looks_like_apartment(label),
        })

    return {
        "total_rows": total_rows,
        "transfers_skipped": transfers_skipped,
        "skipped_empty": skipped_empty,
        "new_accounts": new_accounts,
        "existing_accounts": known_accounts,
        "detected_labels": labels_info,
        "category_mapping": category_mapping,
    }


def _looks_like_apartment(label: str) -> bool:
    """
    Heuristic: if a label looks like a property/apartment name.
    Exclude known non-property labels.
    """
    non_property_keywords = [
        "martha", "lucía", "lucia", "eliecer", "mazda", "taxi",
        "restrepo", "uribe", "jaramillo",
    ]
    label_lower = label.lower()
    for kw in non_property_keywords:
        if kw in label_lower:
            return False
    return True


# ── Step 2: Process Import ───────────────────────────────

async def process_import(
    db: AsyncSession,
    file_content: str,
    confirmed_apartment_labels: list[str],
    user_id: str,
) -> dict:
    """
    Process the CSV import:
    1. Create missing bank accounts
    2. Create properties for confirmed apartment labels
    3. Import all non-transfer transactions
    """
    rows = _parse_csv(file_content)

    # ── 1. Build / refresh account lookup ─────────────────
    result_acc = await db.execute(select(BankAccount))
    accounts_cache = {
        a.account_name.lower(): a.id
        for a in result_acc.scalars().all()
    }
    accounts_created = []

    # Detect all unique account names from the CSV
    csv_account_names = set()
    for row in rows:
        name = row.get("account", "").strip()
        if name:
            csv_account_names.add(name)

    # Create missing accounts
    for name in csv_account_names:
        if name.lower() not in accounts_cache:
            new_account = await ledger_service.create_account(db, {
                "account_name": name,
                "account_type": AccountType.AHORROS.value,
                "bank_name": name,
                "currency": "COP",
                "initial_balance": 0,
            })
            accounts_cache[name.lower()] = new_account.id
            accounts_created.append(name)

    # ── 2. Build / refresh property lookup ────────────────
    result_prop = await db.execute(select(Property))
    properties_cache = {
        p.name.lower(): p.id
        for p in result_prop.scalars().all()
    }
    properties_created = []

    confirmed_lower = {lbl.lower() for lbl in confirmed_apartment_labels}

    for label in confirmed_apartment_labels:
        if label.lower() not in properties_cache:
            new_prop = Property(
                owner_id=user_id,
                name=label,
                property_type=PropertyType.APARTAMENTO.value,
                address="Pendiente de actualizar",
                city="Medellín",
                country="Colombia",
                latitude=6.2442,
                longitude=-75.5812,
                area_sqm=0,
                status=PropertyStatus.DISPONIBLE.value,
            )
            db.add(new_prop)
            db.flush()  # Get the ID without full commit
            properties_cache[label.lower()] = new_prop.id
            properties_created.append(label)

    # ── 3. Import transactions (bypass balance checks for historical data) ──
    imported_count = 0
    errors = []
    balance_deltas: dict[str, float] = {}  # account_id -> net balance change

    for row_idx, row in enumerate(rows, start=2):
        try:
            account_name = row.get("account", "").strip()
            if not account_name:
                continue

            # Process transfers (don't skip them, otherwise balances won't match)
            is_transfer = row.get("transfer", "").strip().lower() == "true"
            # We don't continue anymore.

            csv_category = row.get("category", "General").strip()
            amount_str = row.get("amount", "0").replace(",", ".")
            csv_type = row.get("type", "Gasto").strip()
            note = row.get("note", "").strip()
            date_str = row.get("date", "").strip()
            label = row.get("labels", "").strip()
            payment_type = row.get("payment_type", "").strip()
            payee = row.get("payee", "").strip()

            # Account ID
            account_id = accounts_cache.get(account_name.lower())
            if not account_id:
                errors.append(f"Fila {row_idx}: Cuenta '{account_name}' no encontrada.")
                continue

            # Property ID (only for confirmed apartment labels)
            property_id = None
            if label and label.lower() in confirmed_lower:
                property_id = properties_cache.get(label.lower())

            # Amount
            try:
                amount = abs(float(amount_str))
            except ValueError:
                amount = 0.0
            if amount <= 0:
                continue

            # Date
            try:
                tx_date = date_parser.parse(date_str).date() if date_str else date.today()
            except Exception:
                tx_date = date.today()

            # Map category
            if is_transfer:
                mapped_category = TransactionCategory.TRANSFERENCIA_INTERNA.value
                tx_type_val = TransactionType.TRANSFERENCIA.value
            else:
                mapped_category = map_category(csv_category, note, csv_type)
                tx_type_val = TransactionType.INGRESO.value if csv_type.lower() == "ingreso" else TransactionType.GASTO.value

            # Map direction
            if csv_type.lower() == "ingreso":
                direction = TransactionDirection.DEBIT.value
            else:
                direction = TransactionDirection.CREDIT.value

            # Build description with context
            desc_parts = []
            if note:
                desc_parts.append(note)
            if payee:
                desc_parts.append(f"({payee})")
            if payment_type:
                desc_parts.append(f"[{payment_type}]")
            description = " ".join(desc_parts) or "Importado de CSV"

            # Create transaction directly (bypass register_transaction to avoid
            # InsufficientFundsError on historical data)
            transaction = Transaction(
                account_id=account_id,
                property_id=property_id,
                transaction_type=tx_type_val,
                category=mapped_category,
                amount=amount,
                direction=direction,
                description=description,
                transaction_date=tx_date,
                recorded_by=user_id,
            )
            db.add(transaction)

            # Track balance delta
            if account_id not in balance_deltas:
                balance_deltas[account_id] = 0.0
            if direction == TransactionDirection.DEBIT.value:
                balance_deltas[account_id] += amount
            else:
                balance_deltas[account_id] -= amount

            imported_count += 1

        except Exception as e:
            errors.append(f"Fila {row_idx}: {str(e)}")

    # ── 4. Apply accumulated balance deltas to accounts ───
    for account_id, delta in balance_deltas.items():
        result_acc = await db.execute(
            select(BankAccount).where(BankAccount.id == account_id)
        )
        account = result_acc.scalar_one_or_none()
        if account:
            account.current_balance = float(account.current_balance) + delta

    await db.commit()

    return {
        "imported": imported_count,
        "accounts_created": accounts_created,
        "properties_created": properties_created,
        "errors": errors[:50],  # Cap errors to avoid huge responses
    }

