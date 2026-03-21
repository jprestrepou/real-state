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
from app.models.property import Property
from app.models.budget import Budget

UPLOADS_DIR = "uploads/contracts"

def _format_currency(value: float) -> str:
    """Basic currency formatter: $ X.XXX.XXX,XX"""
    return "${:,.2f}".format(value).replace(",", "X").replace(".", ",").replace("X", ".")

async def generate_contract_pdf(contract: Contract) -> str:
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

    story.append(Paragraph("CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA", title_style))
    story.append(Spacer(1, 0.2 * inch))

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

    doc.build(story)

    return filepath

async def generate_termination_letter(contract: Contract, reason: str, termination_date: date) -> str:
    """
    Generates a formal contract termination letter.
    """
    if not os.path.exists(UPLOADS_DIR):
        os.makedirs(UPLOADS_DIR, exist_ok=True)

    filename = f"terminacion_{contract.id[:8]}.pdf"
    filepath = os.path.join(UPLOADS_DIR, filename)

    doc = SimpleDocTemplate(filepath, pagesize=LETTER,
                            rightMargin=inch, leftMargin=inch,
                            topMargin=inch, bottomMargin=inch)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], alignment=TA_CENTER, spaceAfter=20)
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=11, leading=16, alignment=TA_JUSTIFY, spaceAfter=10)

    story = []
    
    today_str = date.today().strftime('%d de %B de %Y')
    story.append(Paragraph(f"Ciudad y Fecha: {contract.property.city}, {today_str}", body_style))
    story.append(Spacer(1, 0.3 * inch))
    
    story.append(Paragraph(f"Señor(a):<br/>{contract.tenant_name.upper()}", body_style))
    story.append(Paragraph(f"Ref: <b>Aviso de Terminación de Contrato de Arrendamiento</b>", body_style))
    story.append(Spacer(1, 0.3 * inch))

    text = (
        f"Respetado(a) Señor(a):<br/><br/>"
        f"Por medio de la presente, actuando en calidad de arrendador del inmueble ubicado en la "
        f"dirección <b>{contract.property.address}</b>, me permito notificarle "
        f"la decisión de dar por terminado el contrato de arrendamiento suscrito entre las partes."
    )
    story.append(Paragraph(text, body_style))
    
    reason_text = f"<b>Motivo de terminación:</b> {reason}"
    story.append(Paragraph(reason_text, body_style))
    
    date_text = f"<b>Fecha efectiva de terminación y restitución del inmueble:</b> {termination_date.strftime('%d de %B de %Y')}"
    story.append(Paragraph(date_text, body_style))
    
    closing = (
        "Le recordamos que a la fecha de restitución el inmueble debe entregarse "
        "en las mismas condiciones en que fue recibido, a paz y salvo por concepto de cánones "
        "y servicios públicos."
    )
    story.append(Paragraph(closing, body_style))
    story.append(Spacer(1, 0.5 * inch))

    story.append(Paragraph("Cordialmente,", body_style))
    story.append(Spacer(1, 0.4 * inch))
    story.append(Paragraph("_________________________<br/><b>EL ARRENDADOR</b>", body_style))

    doc.build(story)
    return filepath


async def generate_inventory_report(prop: Property, check_type: str, items: list[dict], notes: str) -> str:
    """
    Generates a Check-In / Check-Out inventory report.
    check_type is expected to be "Check-In" or "Check-Out"
    items is a list of dicts: {"area": "Sala", "item": "Paredes", "status": "Bueno", "observations": ""}
    """
    if not os.path.exists(UPLOADS_DIR):
        os.makedirs(UPLOADS_DIR, exist_ok=True)

    filename = f"inventario_{check_type.lower()}_{prop.id[:8]}.pdf"
    filepath = os.path.join(UPLOADS_DIR, filename)

    doc = SimpleDocTemplate(filepath, pagesize=LETTER,
                            rightMargin=inch, leftMargin=inch,
                            topMargin=inch, bottomMargin=inch)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], alignment=TA_CENTER, spaceAfter=20)
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, spaceAfter=10)

    story = []

    story.append(Paragraph(f"ACTA DE INVENTARIO: {check_type.upper()}", title_style))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph(f"<b>Fecha:</b> {date.today()}", body_style))
    story.append(Paragraph(f"<b>Propiedad:</b> {prop.name} - {prop.address}", body_style))
    story.append(Spacer(1, 0.2 * inch))

    table_data = [["Área", "Ítem", "Estado", "Observaciones"]]
    for item in items:
        table_data.append([
            item.get("area", ""),
            item.get("item", ""),
            item.get("status", ""),
            item.get("observations", "")
        ])

    t = Table(table_data, colWidths=[1.5 * inch, 1.5 * inch, 1.0 * inch, 2.0 * inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(t)
    story.append(Spacer(1, 0.3 * inch))

    if notes:
        story.append(Paragraph("<b>Notas Generales:</b>", body_style))
        story.append(Paragraph(notes, body_style))
        story.append(Spacer(1, 0.3 * inch))

    story.append(Paragraph("Con la firma de este documento, las partes aceptan el estado reportado del inmueble.", body_style))
    story.append(Spacer(1, 0.5 * inch))
    
    sig_data = [
        ["__________________________", "__________________________"],
        ["FIRMA ARRENDADOR", "FIRMA ARRENDATARIO"]
    ]
    sig_table = Table(sig_data, colWidths=[3 * inch, 3 * inch])
    sig_table.setStyle(TableStyle([('ALIGN', (0, 0), (-1, -1), 'CENTER')]))
    story.append(sig_table)

    doc.build(story)
    return filepath


async def generate_budget_pdf(budget: Budget) -> str:
    """
    Generates a formal PDF report for a budget, including a basic summary and list of categories.
    """
    if not os.path.exists(UPLOADS_DIR):
        os.makedirs(UPLOADS_DIR, exist_ok=True)

    filename = f"presupuesto_{budget.id[:8]}.pdf"
    filepath = os.path.join(UPLOADS_DIR, filename)

    doc = SimpleDocTemplate(filepath, pagesize=LETTER,
                            rightMargin=inch, leftMargin=inch,
                            topMargin=inch, bottomMargin=inch)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], alignment=TA_CENTER, spaceAfter=20)
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=11, leading=16, spaceAfter=10)

    story = []
    
    prop_name = budget.property_rel.name if getattr(budget, "property_rel", None) else "General (Todas las propiedades)"
    
    story.append(Paragraph(f"REPORTE DE PRESUPUESTO", title_style))
    story.append(Spacer(1, 0.2 * inch))
    
    story.append(Paragraph(f"<b>Propiedad:</b> {prop_name}", body_style))
    story.append(Paragraph(f"<b>Período:</b> {budget.year} - Mes {budget.month} ({budget.period_type})", body_style))
    story.append(Paragraph(f"<b>Presupuestado:</b> ${float(budget.total_budget):,.2f}", body_style))
    story.append(Paragraph(f"<b>Ejecutado:</b> ${float(budget.total_executed):,.2f} ({budget.execution_pct}%)", body_style))
    story.append(Paragraph(f"<b>Estado:</b> {budget.semaphore}", body_style))
    story.append(Spacer(1, 0.3 * inch))

    # Table for categories
    table_data = [["Categoría", "Presupuestado", "Ejecutado", "%", "Estado"]]
    for cat in budget.categories:
        table_data.append([
            cat.category_name,
            f"${float(cat.budgeted_amount):,.2f}",
            f"${float(cat.executed_amount):,.2f}",
            f"{cat.execution_pct}%",
            cat.semaphore
        ])

    t = Table(table_data, colWidths=[2.5 * inch, 1.2 * inch, 1.2 * inch, 0.8 * inch, 0.8 * inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')), # primary-600 in tailwind
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(t)
    doc.build(story)
    return filepath


async def generate_inventory_pdf(inventory) -> str:
    """
    Generates a formal Acta de Inventario/Entrega PDF from a PropertyInventory ORM instance.
    Items must be eagerly loaded before calling this function.
    """
    if not os.path.exists(UPLOADS_DIR):
        os.makedirs(UPLOADS_DIR, exist_ok=True)

    inv_type = getattr(inventory, "inventory_type", "Inventario")
    safe_type = inv_type.lower().replace(' ', '_').replace('o', 'o').replace('i', 'i')
    filename = f"acta_{safe_type}_{inventory.id[:8]}.pdf"
    filepath = os.path.join(UPLOADS_DIR, filename)

    doc = SimpleDocTemplate(filepath, pagesize=LETTER,
                            rightMargin=inch, leftMargin=inch,
                            topMargin=inch, bottomMargin=0.8 * inch)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'InvTitle', parent=styles['Heading1'],
        fontSize=14, alignment=TA_CENTER, spaceAfter=10, fontName='Helvetica-Bold'
    )
    body_style = ParagraphStyle(
        'InvBody', parent=styles['Normal'],
        fontSize=10, leading=14, spaceAfter=8, fontName='Helvetica'
    )
    section_style = ParagraphStyle(
        'InvSection', parent=styles['Normal'],
        fontSize=9, fontName='Helvetica-Bold', spaceAfter=4
    )

    story = []

    type_labels = {
        "Ingreso": "ACTA DE ENTREGA - INGRESO DE INMUEBLE",
        "Salida": "ACTA DE ENTREGA - SALIDA DE INMUEBLE",
        "Verificacion": "ACTA DE VERIFICACION DE INVENTARIO"
    }
    story.append(Paragraph(type_labels.get(inv_type, f"ACTA DE INVENTARIO - {inv_type.upper()}"), title_style))

    inv_date = getattr(inventory, "date", date.today())
    date_str = inv_date.strftime('%d de %B de %Y') if hasattr(inv_date, 'strftime') else str(inv_date)
    story.append(Paragraph(f"Fecha de elaboracion: {date_str}", body_style))
    story.append(Spacer(1, 0.15 * inch))

    prop = getattr(inventory, "property", None)
    if prop:
        story.append(Paragraph(f"<b>Propiedad:</b> {prop.name} - {prop.address}, {prop.city}", body_style))
    if inventory.notes:
        story.append(Paragraph(f"<b>Observaciones generales:</b> {inventory.notes}", body_style))
    story.append(Spacer(1, 0.2 * inch))

    items = getattr(inventory, "items", [])
    if items:
        story.append(Paragraph("DETALLE DE ITEMS POR AREA", section_style))
        story.append(Spacer(1, 0.08 * inch))

        cond_colors = {
            "Excelente": colors.HexColor('#D1FAE5'),
            "Bueno": colors.HexColor('#FEF9C3'),
            "Regular": colors.HexColor('#FFEDD5'),
            "Malo": colors.HexColor('#FEE2E2'),
            "No Aplica": colors.HexColor('#F1F5F9'),
        }

        table_data = [["Area / Categoria", "Item", "Cant.", "Estado", "Observaciones"]]
        style_cmds = [
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
        ]

        for idx, item in enumerate(items):
            row_num = idx + 1
            cond = getattr(item, "condition", "")
            table_data.append([
                getattr(item, "category", ""),
                getattr(item, "item_name", ""),
                str(getattr(item, "quantity", 1)),
                cond,
                getattr(item, "notes", "") or ""
            ])
            bg = cond_colors.get(cond, colors.white)
            style_cmds.append(('BACKGROUND', (3, row_num), (3, row_num), bg))

        t = Table(table_data, colWidths=[1.4 * inch, 1.6 * inch, 0.5 * inch, 0.9 * inch, 2.1 * inch])
        t.setStyle(TableStyle(style_cmds))
        story.append(t)
    else:
        story.append(Paragraph("No se registraron items en este inventario.", body_style))

    story.append(Spacer(1, 0.4 * inch))
    story.append(Paragraph(
        "Con la firma del presente documento las partes declaran haber recibido/entregado el inmueble "
        "en el estado descrito anteriormente y se obligan a su cumplimiento.",
        body_style
    ))
    story.append(Spacer(1, 0.5 * inch))

    sig_data = [
        ["__________________________", "__________________________"],
        ["FIRMA ARRENDADOR / GESTOR", "FIRMA ARRENDATARIO"],
        ["Nombre: _________________", "Nombre: _________________"],
        ["CC: ____________________", "CC: ____________________"],
    ]
    sig_table = Table(sig_data, colWidths=[3 * inch, 3 * inch])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(sig_table)

    doc.build(story)
    return filepath
