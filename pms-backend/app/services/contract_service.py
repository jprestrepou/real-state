"""
Contract service — lease management + payment schedule generation.
"""

from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException

from app.models.contract import Contract, PaymentSchedule, ContractStatus, PaymentStatus
from app.schemas.contract import ContractCreate, ContractUpdate, ContractSignRequest
from app.services.pdf_service import generate_contract_pdf
from app.tasks.email_tasks import send_contract_revision_email, send_contract_signature_request_email
import hashlib
from datetime import datetime

from app.models.property import Property

async def list_contracts(
    db: AsyncSession,
    property_id: str | None = None,
    status_filter: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Contract], int]:
    stmt = select(Contract).options(selectinload(Contract.property)).join(Property, Contract.property_id == Property.id)
    if property_id:
        stmt = stmt.where(Contract.property_id == property_id)
    if status_filter:
        stmt = stmt.where(Contract.status == status_filter)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    result = await db.execute(count_stmt)
    total = result.scalar() or 0

    stmt = stmt.order_by(Contract.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(stmt)
    contracts = result.scalars().all()
    
    # Enrich with property info
    for c in contracts:
        # Load property if not already loaded (though join helped)
        # In async, we should be careful with lazy loading
        c.property_name = c.property.name if c.property else "Sin asignar"
        c.property_address = c.property.address if c.property else ""
    return contracts, total


async def get_contract(db: AsyncSession, contract_id: str) -> Contract:
    stmt = select(Contract).options(selectinload(Contract.property)).where(Contract.id == contract_id)
    result = await db.execute(stmt)
    contract = result.scalar_one_or_none()
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    
    # Enrich
    contract.property_name = contract.property.name if contract.property else "Sin asignar"
    contract.property_address = contract.property.address if contract.property else ""
    return contract


async def create_contract(db: AsyncSession, data: ContractCreate, user_id: str) -> Contract:
    contract = Contract(
        **data.model_dump(),
        created_by=user_id,
    )
    db.add(contract)
    await db.flush()

    # Generate payment schedule if contract is active
    if contract.status == ContractStatus.ACTIVO.value:
        await _generate_payment_schedule(db, contract)

    await db.commit()
    await db.refresh(contract)
    return contract


async def activate_contract(db: AsyncSession, contract_id: str) -> Contract:
    """Activate a contract (Borrador or Firmado) and generate payment schedule."""
    contract = await get_contract(db, contract_id)
    allowed_statuses = [ContractStatus.FIRMADO.value, ContractStatus.BORRADOR.value]
    if contract.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Solo se pueden activar contratos en Borrador o Firmado")

    contract.status = ContractStatus.ACTIVO.value

    # Update property status to Arrendada
    from app.models.property import Property, PropertyStatus
    stmt = select(Property).where(Property.id == contract.property_id)
    result = await db.execute(stmt)
    prop = result.scalar_one_or_none()
    if prop:
        prop.status = PropertyStatus.ARRENDADA.value

    # Delete any existing schedule before regenerating
    from sqlalchemy import delete as sa_delete
    await db.execute(sa_delete(PaymentSchedule).where(PaymentSchedule.contract_id == contract.id))

    await _generate_payment_schedule(db, contract)

    await db.commit()
    await db.refresh(contract)
    return contract

async def send_contract_for_signature(db: AsyncSession, contract_id: str) -> Contract:
    contract = await get_contract(db, contract_id)
    if contract.status != ContractStatus.BORRADOR.value:
        raise HTTPException(status_code=400, detail="Solo se pueden enviar a firma contratos en borrador")
    
    contract.status = ContractStatus.ENVIADO_A_FIRMA.value
    
    try:
        if not contract.pdf_file:
            pdf_path = await generate_contract_pdf(contract)
            contract.pdf_file = pdf_path
            
        recipients = [contract.tenant_email] if contract.tenant_email else []
        if recipients:
            signing_url = f"https://app.example.com/sign/{contract.id}" # Simulated URL
            send_contract_signature_request_email.delay(contract.id, signing_url, recipients)
            
    except Exception as e:
        print(f"Error sending signature request: {e}")

    await db.commit()
    await db.refresh(contract)
    return contract

async def sign_contract(db: AsyncSession, contract_id: str, data: ContractSignRequest, ip_address: str) -> Contract:
    contract = await get_contract(db, contract_id)
    if contract.status != ContractStatus.ENVIADO_A_FIRMA.value:
        raise HTTPException(status_code=400, detail="El contrato no está pendiente de firma")
        
    if contract.tenant_email != data.tenant_email:
        raise HTTPException(status_code=400, detail="Credenciales de firma inválidas")
        
    contract.status = ContractStatus.FIRMADO.value
    contract.signed_at = datetime.now()
    contract.signed_ip = ip_address
    
    # Simple hash of contract ID + email + timestamp
    base_string = f"{contract.id}|{data.tenant_email}|{contract.signed_at.isoformat()}"
    contract.signature_hash = hashlib.sha256(base_string.encode()).hexdigest()
    
    await db.commit()
    await db.refresh(contract)
    return contract


async def update_contract(db: AsyncSession, contract_id: str, data: ContractUpdate) -> Contract:
    contract = await get_contract(db, contract_id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(contract, key, value)
    await db.commit()
    await db.refresh(contract)
    return contract


async def get_payment_schedules(db: AsyncSession, contract_id: str) -> list[PaymentSchedule]:
    stmt = select(PaymentSchedule).where(
        PaymentSchedule.contract_id == contract_id
    ).order_by(PaymentSchedule.due_date)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def _generate_payment_schedule(db: AsyncSession, contract: Contract) -> None:
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


async def mark_payment_as_paid(db: AsyncSession, payment_id: str, account_id: str, user_id: str, override_amount: float | None = None) -> PaymentSchedule:
    """
    Mark a payment as paid and register a transaction in the financial module.
    """
    stmt = select(PaymentSchedule).where(PaymentSchedule.id == payment_id)
    result = await db.execute(stmt)
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
        
    if payment.status == PaymentStatus.PAGADO.value:
        raise HTTPException(status_code=400, detail="El pago ya está registrado como pagado")

    # Load contract explicitly
    contract_stmt = select(Contract).where(Contract.id == payment.contract_id)
    contract_result = await db.execute(contract_stmt)
    contract = contract_result.scalar_one_or_none()
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato asociado no encontrado")

    # Mark as paid and potentially update amount
    payment.status = PaymentStatus.PAGADO.value
    payment.paid_date = date.today()
    
    final_amount = float(override_amount if override_amount is not None else payment.amount)
    if override_amount is not None:
        payment.amount = override_amount

    # Create financial transaction using standardized service
    from app.services import ledger_service
    from app.models.financial import TransactionDirection, TransactionType, TransactionCategory
    from app.schemas.financial import TransactionCreate

    try:
        transaction = await ledger_service.register_transaction(
            db,
            data=TransactionCreate(
                account_id=account_id,
                property_id=contract.property_id,
                transaction_type=TransactionType.INGRESO.value,
                category=TransactionCategory.ARRIENDO.value,
                amount=final_amount,
                direction=TransactionDirection.DEBIT.value,
                description=f"Pago Canon - {contract.tenant_name} - {payment.due_date}",
                transaction_date=date.today(),
                reference_id=payment.id,
                reference_type="payment_schedule",
            ),
            recorded_by=user_id,
            commit=False,
        )
        payment.transaction_id = transaction.id
    except HTTPException as e:
        if e.status_code == 404 and "Propiedad" in str(e.detail):
            # Property not found or inactive — retry without property_id
            transaction = await ledger_service.register_transaction(
                db,
                data=TransactionCreate(
                    account_id=account_id,
                    property_id=None,
                    transaction_type=TransactionType.INGRESO.value,
                    category=TransactionCategory.ARRIENDO.value,
                    amount=final_amount,
                    direction=TransactionDirection.DEBIT.value,
                    description=f"Pago Canon - {contract.tenant_name} - {payment.due_date}",
                    transaction_date=date.today(),
                    reference_id=payment.id,
                    reference_type="payment_schedule",
                ),
                recorded_by=user_id,
                commit=False,
            )
            payment.transaction_id = transaction.id
        else:
            raise

    await db.commit()
    await db.refresh(payment)
    return payment
