"""
PDF Service — Generate contract PDFs.
"""

import os
from datetime import date
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib import colors

from app.models.contract import Contract

UPLOADS_DIR = "uploads/contracts"

def generate_contract_pdf(contract: Contract) -> str:
    """
    Generates a PDF for the contract and returns the relative path.
    """
    if not os.path.exists(UPLOADS_DIR):
        os.makedirs(UPLOADS_DIR, exist_ok=True)

    filename = f"contrato_{contract.id[:8]}.pdf"
    filepath = os.path.join(UPLOADS_DIR, filename)

    c = canvas.Canvas(filepath, pagesize=LETTER)
    width, height = LETTER

    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, height - inch, "CONTRATO DE ARRENDAMIENTO")
    
    c.setFont("Helvetica", 10)
    c.drawCentredString(width / 2, height - 1.2 * inch, f"ID: {contract.id}")

    # Body
    text = c.beginText(inch, height - 2 * inch)
    text.setFont("Helvetica-Bold", 12)
    text.textLine("PARTES DEL CONTRATO")
    text.setFont("Helvetica", 11)
    text.moveCursor(0, 15)
    text.textLine(f"Arrendatario: {contract.tenant_name}")
    text.textLine(f"Documento: {contract.tenant_document or 'N/A'}")
    text.textLine(f"Email: {contract.tenant_email or 'N/A'}")
    text.textLine(f"Teléfono: {contract.tenant_phone or 'N/A'}")
    
    text.moveCursor(0, 30)
    text.setFont("Helvetica-Bold", 12)
    text.textLine("DETALLES DE LA PROPIEDAD")
    text.setFont("Helvetica", 11)
    text.moveCursor(0, 15)
    text.textLine(f"Propiedad: {getattr(contract, 'property_name', 'N/A')}")
    text.textLine(f"Dirección: {getattr(contract, 'property_address', 'N/A')}")
    text.textLine(f"Tipo de Contrato: {contract.contract_type}")
    
    text.moveCursor(0, 30)
    text.setFont("Helvetica-Bold", 12)
    text.textLine("CONDICIONES FINANCIERAS")
    text.setFont("Helvetica", 11)
    text.moveCursor(0, 15)
    text.textLine(f"Canon Mensual: ${contract.monthly_rent:,.2f}")
    text.textLine(f"Depósito: ${contract.deposit_amount or 0:,.2f}")
    text.textLine(f"Incremento Anual: {contract.annual_increment_pct or 0}%")
    
    text.moveCursor(0, 30)
    text.setFont("Helvetica-Bold", 12)
    text.textLine("VIGENCIA")
    text.setFont("Helvetica", 11)
    text.moveCursor(0, 15)
    text.textLine(f"Fecha Inicio: {contract.start_date}")
    text.textLine(f"Fecha Fin: {contract.end_date}")
    
    c.drawText(text)

    # Footer/Signatures
    c.setStrokeColor(colors.black)
    c.line(inch, 2 * inch, 3.5 * inch, 2 * inch)
    c.line(width - 3.5 * inch, 2 * inch, width - inch, 2 * inch)
    
    c.setFont("Helvetica", 9)
    c.drawString(inch, 1.8 * inch, "Firma Arrendador")
    c.drawString(width - 3.5 * inch, 1.8 * inch, "Firma Arrendatario")

    c.showPage()
    c.save()

    return filepath
