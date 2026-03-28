"""
Invoice Service — Accounts Receivable logic
"""
from datetime import date, timedelta
from typing import List
import calendar

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.invoice import Invoice, InvoiceStatus
from app.models.contract import Contract, ContractStatus
from app.services.telegram_service import TelegramService
import logging

logger = logging.getLogger(__name__)

class InvoiceService:
    @staticmethod
    async def get_invoices(db: AsyncSession) -> List[Invoice]:
        result = await db.execute(select(Invoice).order_by(Invoice.due_date.desc()))
        return list(result.scalars().all())

    @staticmethod
    async def get_invoice(db: AsyncSession, invoice_id: str) -> Invoice:
        result = await db.execute(select(Invoice).where(Invoice.id == invoice_id))
        invoice = result.scalars().first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Factura no encontrada")
        return invoice

    @staticmethod
    async def generate_monthly_invoices(db: AsyncSession):
        """
        Idempotent function that generates invoices for all active contracts on their monthly anniversary.
        """
        today = date.today()
        
        result = await db.execute(select(Contract).where(Contract.status == ContractStatus.ACTIVO.value))
        contracts = result.scalars().all()
        
        for contract in contracts:
            if not contract.start_date:
                continue
                
            last_day = calendar.monthrange(today.year, today.month)[1]
            anniversary_day = min(contract.start_date.day, last_day)
            anniversary_this_month = date(today.year, today.month, anniversary_day)
                
            if today == anniversary_this_month:
                # Check if invoice already exists
                stmt = select(Invoice).where(
                    Invoice.contract_id == contract.id,
                    Invoice.issue_date == today
                )
                existing = (await db.execute(stmt)).scalars().first()
                if existing:
                    continue
                
                # Due date: defaults to 5 days, or use contract setting if available
                payment_days = getattr(contract, 'payment_due_days', 5)
                due = today + timedelta(days=payment_days)
                
                inv = Invoice(
                    contract_id=contract.id,
                    property_id=contract.property_id,
                    issue_date=today,
                    due_date=due,
                    amount=contract.current_rent,
                    status=InvoiceStatus.PENDIENTE.value
                )
                db.add(inv)
                
                if contract.tenant_telegram_chat_id:
                    try:
                        await TelegramService.send_message(
                            db=db,
                            chat_id=contract.tenant_telegram_chat_id,
                            text=(
                                f"🧾 *Nueva Factura de Arriendo*\n\n"
                                f"Estimado(a) *{contract.tenant_name}*,\n"
                                f"Se ha generado su cobro de arriendo.\n\n"
                                f"💰 *Monto:* ${contract.current_rent:,.2f}\n"
                                f"📅 *Vencimiento:* {due.strftime('%Y-%m-%d')}\n\n"
                                f"Por favor realice el pago oportunamente para evitar cargos moratorios."
                            )
                        )
                    except Exception as e:
                        logger.error(f"Failed to notify tenant about invoice: {e}")
        
        await db.commit()

    @staticmethod
    async def update_overdue_invoices(db: AsyncSession):
        """Marks pending invoices as overdue if today > due_date."""
        today = date.today()
        stmt = (
            update(Invoice)
            .where(Invoice.status == InvoiceStatus.PENDIENTE.value)
            .where(Invoice.due_date < today)
            .values(status=InvoiceStatus.VENCIDA.value)
        )
        await db.execute(stmt)
        await db.commit()

    @staticmethod
    async def mark_invoice_as_paid(db: AsyncSession, invoice_id: str, commit: bool = True):
        """Marks invoice as paid."""
        invoice = await InvoiceService.get_invoice(db, invoice_id)
        if invoice.status == InvoiceStatus.PAGADA.value:
            return invoice
            
        invoice.status = InvoiceStatus.PAGADA.value
        if commit:
            await db.commit()
            await db.refresh(invoice)
            
        # Optional: send thank you note via Telegram
        # This is omitted here to keep transactions fast, can be moved to background
        
        return invoice
