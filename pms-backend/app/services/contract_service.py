"""
Contract service — lease management + payment schedule generation.
"""

from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from fastapi import HTTPException

from app.models.contract import Contract, PaymentSchedule, ContractStatus, PaymentStatus
from app.schemas.contract import ContractCreate, ContractUpdate
from app.services.pdf_service import generate_contract_pdf
from app.tasks.email_tasks import send_contract_revision_email


from app.models.property import Property

def list_contracts(
    db: Session,
    property_id: str | None = None,
    status_filter: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Contract], int]:
    stmt = select(Contract).join(Property, Contract.property_id == Property.id)
    if property_id:
        stmt = stmt.where(Contract.property_id == property_id)
    if status_filter:
        stmt = stmt.where(Contract.status == status_filter)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = db.execute(count_stmt).scalar() or 0

    stmt = stmt.order_by(Contract.created_at.desc()).offset((page - 1) * limit).limit(limit)
    # We want the objects, but with property attributes accessible
    contracts = db.execute(stmt).scalars().all()
    for c in contracts:
        c.property_name = c.property.name
        c.property_address = c.property.address
    return contracts, total


def get_contract(db: Session, contract_id: str) -> Contract:
    stmt = select(Contract).where(Contract.id == contract_id)
    contract = db.execute(stmt).scalar_one_or_none()
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    
    # Enrich with property info
    contract.property_name = contract.property.name
    contract.property_address = contract.property.address
    return contract


def create_contract(db: Session, data: ContractCreate, user_id: str) -> Contract:
    contract = Contract(
        **data.model_dump(),
        created_by=user_id,
    )
    db.add(contract)
    db.flush()

    # Generate payment schedule if contract is active
    if contract.status == ContractStatus.ACTIVO.value:
        _generate_payment_schedule(db, contract)

    db.commit()
    db.refresh(contract)
    return contract


def activate_contract(db: Session, contract_id: str) -> Contract:
    """Activate a draft contract and generate payment schedule."""
    contract = get_contract(db, contract_id)
    if contract.status != ContractStatus.BORRADOR.value:
        raise HTTPException(status_code=400, detail="Solo se pueden activar contratos en borrador")

    contract.status = ContractStatus.ACTIVO.value

    # Update property status to Arrendada
    from app.models.property import Property, PropertyStatus
    prop = db.execute(select(Property).where(Property.id == contract.property_id)).scalar_one_or_none()
    if prop:
        prop.status = PropertyStatus.ARRENDADA.value

    _generate_payment_schedule(db, contract)
    
    # PDF and Email integration
    try:
        pdf_path = generate_contract_pdf(contract)
        contract.pdf_file = pdf_path
        
        # Trigger email revision task (async)
        # Assuming we have tenant email and maybe a landlord email (manager email)
        recipients = []
        if contract.tenant_email:
            recipients.append(contract.tenant_email)
        
        if recipients:
            send_contract_revision_email.delay(contract.id, pdf_path, recipients)
            
    except Exception as e:
        print(f"Error in contract post-activation logic: {e}")

    db.commit()
    db.refresh(contract)
    return contract


def update_contract(db: Session, contract_id: str, data: ContractUpdate) -> Contract:
    contract = get_contract(db, contract_id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(contract, key, value)
    db.commit()
    db.refresh(contract)
    return contract


def get_payment_schedules(db: Session, contract_id: str) -> list[PaymentSchedule]:
    stmt = select(PaymentSchedule).where(
        PaymentSchedule.contract_id == contract_id
    ).order_by(PaymentSchedule.due_date)
    return list(db.execute(stmt).scalars().all())


def _generate_payment_schedule(db: Session, contract: Contract) -> None:
    """Generate monthly payment rows from contract start to end date."""
    current = contract.start_date
    end = contract.end_date
    rent = float(contract.monthly_rent)
    increment = float(contract.annual_increment_pct or 0)
    year_start = current.year

    while current <= end:
        # Apply annual IPC increment
        years_passed = current.year - year_start
        if years_passed > 0 and increment > 0:
            amount = rent * ((1 + increment / 100) ** years_passed)
        else:
            amount = rent

        schedule = PaymentSchedule(
            contract_id=contract.id,
            due_date=current,
            amount=round(amount, 2),
        )
        db.add(schedule)

        # Move to next month
        current = current + relativedelta(months=1)


def mark_payment_as_paid(db: Session, payment_id: str, account_id: str) -> PaymentSchedule:
    """
    Mark a payment as paid and register a transaction in the financial module.
    """
    stmt = select(PaymentSchedule).where(PaymentSchedule.id == payment_id)
    payment = db.execute(stmt).scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
        
    if payment.status == PaymentStatus.PAGADO.value:
        raise HTTPException(status_code=400, detail="El pago ya está registrado como pagado")

    payment.status = PaymentStatus.PAGADO.value
    payment.paid_date = date.today()

    # Create financial transaction
    from app.models.financial import Transaction, TransactionDirection, BankAccount
    from app.models.property import Property
    
    contract = payment.contract
    
    transaction = Transaction(
        account_id=account_id,
        property_id=contract.property_id,
        amount=payment.amount,
        direction=TransactionDirection.DEBIT.value, # Income for the landlord
        category="Renta",
        description=f"Pago Canon - {contract.tenant_name} - Vence {payment.due_date}",
        transaction_date=date.today(),
    )
    db.add(transaction)
    db.flush()
    
    payment.transaction_id = transaction.id
    
    # Update account balance
    account = db.execute(select(BankAccount).where(BankAccount.id == account_id)).scalar_one_or_none()
    if account:
        account.current_balance += payment.amount

    db.commit()
    db.refresh(payment)
    return payment
