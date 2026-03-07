"""
PDF Service — Generate professional formal contract PDFs.
"""

import os
from datetime import date
from reportlab.lib.pagesizes import LETTER
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER

from app.models.contract import Contract

UPLOADS_DIR = "uploads/contracts"

def _format_currency(value: float) -> str:
    """Basic currency formatter: $ X.XXX.XXX,XX"""
    return "${:,.2f}".format(value).replace(",", "X").replace(".", ",").replace("X", ".")

def generate_contract_pdf(contract: Contract) -> str:
    """
    Generates a professional formal PDF for the contract using Platypus.
    """
    if not os.path.exists(UPLOADS_DIR):
        os.makedirs(UPLOADS_DIR, exist_ok=True)

    filename = f"contrato_{contract.id[:8]}.pdf"
    filepath = os.path.join(UPLOADS_DIR, filename)

    doc = SimpleDocTemplate(filepath, pagesize=LETTER,
                            rightMargin=inch, leftMargin=inch,
                            topMargin=inch, bottomMargin=inch)

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=14,
        alignment=TA_CENTER,
        spaceAfter=20,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_JUSTIFY,
        leading=14,
        fontName='Helvetica'
    )
    
    bold_style = ParagraphStyle(
        'BoldStyle',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    story = []

    # ── Header ───────────────────────────────────────────
    story.append(Paragraph("CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA", title_style))
    story.append(Spacer(1, 0.2 * inch))

    # ── General Info ─────────────────────────────────────
    prop = contract.property
    landlord_name = prop.owner.full_name if prop.owner else "ADMINISTRADOR"
    
    contract_data = [
        ["LUGAR Y FECHA DEL CONTRATO:", f"{prop.city}, {date.today().strftime('%d de %B de %Y')}"],
        ["ARRENDADOR:", landlord_name.upper()],
        ["ARRENDATARIO:", contract.tenant_name.upper()],
        ["IDENTIFICACIÓN:", f"C.C. {contract.tenant_document or 'N/A'}"],
        ["DIRECCIÓN PROPIEDAD:", prop.address.upper()],
        ["CANON MENSUAL:", _format_currency(float(contract.monthly_rent))],
        ["TÉRMINO DE VIGENCIA:", f"Desde {contract.start_date} hasta {contract.end_date}"],
    ]

    t = Table(contract_data, colWidths=[2 * inch, 4 * inch])
    t.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.3 * inch))

    # ── Clauses ──────────────────────────────────────────
    clauses = [
        ("PRIMERA - OBJETO:", f"El Arrendador entrega al Arrendatario el uso y goce de la propiedad ubicada en {prop.address}, {prop.city}, destinada exclusivamente a vivienda urbana."),
        ("SEGUNDA - CANON DE ARRENDAMIENTO:", f"El precio mensual del arrendamiento es la suma de {_format_currency(float(contract.monthly_rent))} moneda corriente, pagaderos anticipadamente dentro de los primeros (5) días de cada periodo mensual."),
        ("TERCERA - INCREMENTO:", f"En caso de prórroga o renovación del contrato, el canon se incrementará anualmente en un {contract.annual_increment_pct or 0}%, conforme a lo pactado entre las partes."),
        ("CUARTA - SERVICIOS PÚBLICOS:", "El pago de los servicios públicos (agua, luz, gas, alcantarillado, etc.) estará a cargo del Arrendatario desde la entrega material de la propiedad hasta su restitución."),
        ("QUINTA - ESTADO DEL INMUEBLE:", "El Arrendatario declara haber recibido el inmueble en buen estado de conservación y se obliga a devolverlo en el mismo estado, salvo el deterioro natural por el uso legítimo."),
        ("SEXTA - AUTORIZACIÓN PARA CONSULTA EN CENTRALES DE RIESGO:", "El Arrendatario autoriza de manera expresa e irrevocable al Arrendador o a quien este delegue, para consultar, procesar y reportar su comportamiento crediticio a las centrales de riesgo que considere pertinente (DATACREDITO, CIFIN, etc.)."),
        ("SÉPTIMA - MÉRITO EJECUTIVO:", "El presente contrato presta mérito ejecutivo para el cobro de cánones de arrendamiento, servicios públicos o cualquier otra obligación derivada del mismo."),
    ]

    for title, text in clauses:
        story.append(Paragraph(title, bold_style))
        story.append(Paragraph(text, body_style))
        story.append(Spacer(1, 0.15 * inch))

    story.append(Spacer(1, 0.5 * inch))

    # ── Signatures ───────────────────────────────────────
    sig_data = [
        ["__________________________", "__________________________"],
        ["EL ARRENDADOR", "EL ARRENDATARIO"],
        [f"Nombre: {landlord_name}", f"Nombre: {contract.tenant_name}"],
        ["NIT/CC:", f"CC: {contract.tenant_document or ''}"]
    ]
    
    sig_table = Table(sig_data, colWidths=[3 * inch, 3 * inch])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
    ]))
    story.append(sig_table)

    # ── Build PDF ────────────────────────────────────────
    doc.build(story)

    return filepath
