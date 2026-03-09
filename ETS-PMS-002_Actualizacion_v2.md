# ETS-PMS-002 — Actualización de Especificaciones Técnicas
## Property Management System v2.0

> **Documento:** ETS-PMS-002 | **Versión:** 2.0 | **Año:** 2025
> **Sobre:** Complementa ETS-PMS-001 v1.0 — todos los estándares originales permanecen vigentes.

---

## Tabla de Cambios

| Módulo / Área | Tipo de Cambio | Prioridad |
|---|---|---|
| Reconexión Base de Datos (Global) | Corrección crítica | **P0 — Bloqueante** |
| Módulo de Autenticación y Login | Restauración + mejoras | **P0 — Bloqueante** |
| Grupos de Trabajo y Auditoría | Nuevo módulo | P1 — Alta |
| Facility Management + Telegram Bot | Nuevo módulo + integración | P1 — Alta |
| Notificaciones Email Automáticas | Nueva funcionalidad | P1 — Alta |
| Descarga de PDFs de Contratos | Corrección + mejora | P1 — Alta |
| Métricas Avanzadas de Propiedades | Mejora de módulo existente | P2 — Media |
| Pestaña de Arrendatarios en Propiedad | Nuevo componente UI | P2 — Media |
| Cartas de Terminación de Contrato | Nueva funcionalidad legal | P2 — Media |
| Inventarios con Fotos y PDF | Nuevo módulo | P2 — Media |
| Scoring de Riesgo del Arrendatario | Nuevo módulo de análisis | P2 — Media |
| Módulo de Seguros de Arrendamiento | Nuevo módulo | P3 — Normal |

---

## 1. Resumen Ejecutivo y Contexto

### 1.1 Propósito de este Documento

Este documento describe los cambios, correcciones y nuevos módulos a implementar sobre la versión 1.0 del Property Management System. No reemplaza sino complementa el documento ETS-PMS-001. Todos los estándares técnicos, stack y convenciones del documento original se mantienen vigentes.

### 1.2 Estado Actual del Sistema — Issues Conocidos

> ⛔ **Issues Críticos a Resolver**

- `ISSUE-001 [P0]` Base de datos completamente desconectada — ningún módulo persiste datos.
- `ISSUE-002 [P0]` Módulo de login/autenticación perdido — el sistema no tiene control de acceso.
- `ISSUE-003 [P1]` Descarga de PDFs de contratos no funciona — se generan pero no se pueden obtener.
- `ISSUE-004 [P2]` Métricas de propiedades incompletas — faltan KPIs clave de rendimiento.

### 1.3 Nuevas Funcionalidades de esta Versión

- Bot de Telegram para Facility Management: arrendatarios reportan problemas, envían fotos y audios convertidos a texto.
- Notificaciones de email automáticas al activar contratos, con enlace de firma electrónica.
- Grupos de trabajo multiusuario con auditoría completa de acciones (quién, qué, cuándo).
- Scoring automático de riesgo de arrendatarios basado en variables financieras.
- Módulo de inventarios de propiedades con carga de fotos y exportación a PDF.
- Cartas de terminación de contrato bajo marco legal colombiano (Ley 820/2003).
- Módulo de seguros de arrendamiento con catálogo de pólizas disponibles en Colombia.
- Pestaña de arrendatarios en la ficha de cada propiedad.

---

## 2. Correcciones Críticas (P0 — Bloqueantes)

### 2.1 Reconexión de Base de Datos

#### 2.1.1 Diagnóstico del Problema

La desconexión total de la base de datos es la falla más crítica. Ningún dato persiste entre sesiones. Se deben verificar y corregir los siguientes puntos de falla **en orden**:

| # | Punto de Verificación | Archivo | Qué Revisar |
|---|---|---|---|
| 1 | Variables de entorno | `.env` / `config.py` | `DATABASE_URL` existe y tiene formato correcto para PostgreSQL/SQLite |
| 2 | Engine SQLAlchemy | `app/database.py` | `create_async_engine()` recibe la URL correcta, `echo=False` en prod |
| 3 | Creación de tablas | `app/main.py` | `Base.metadata.create_all()` o `alembic upgrade head` se ejecuta al inicio |
| 4 | Session dependency | `app/dependencies.py` | `get_db()` hace `yield` correctamente y cierra la sesión |
| 5 | Importación de modelos | `app/models/__init__.py` | TODOS los modelos están importados antes del `create_all()` |
| 6 | Alembic env.py | `migrations/env.py` | `target_metadata` apunta a `Base.metadata` correcto |

#### 2.1.2 Implementación Correcta de `database.py`

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.config import settings

# Motor principal
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENV == "development",
    pool_pre_ping=True,   # detecta conexiones caídas automáticamente
    pool_recycle=3600,    # recicla conexiones cada hora
)

AsyncSessionLocal = async_sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)

# Dependency para FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

#### 2.1.3 Procedimiento de Recuperación de Datos (SQLite → PostgreSQL)

1. Hacer dump de SQLite: `sqlite3 pms_dev.db .dump > backup.sql`
2. Adaptar tipos de datos del dump (`INTEGER → BIGINT`, `BLOB → BYTEA`).
3. Inicializar PostgreSQL con `alembic upgrade head`.
4. Importar datos: `psql -d pms_db -f backup_adapted.sql`
5. Verificar integridad: contar registros por tabla antes y después.

---

### 2.2 Restauración del Módulo de Autenticación

#### 2.2.1 Alcance — Solo Perfiles de Administrador

En esta versión, el sistema solo tendrá perfiles de tipo Administrador. Los arrendatarios interactúan únicamente a través del bot de Telegram (no tienen acceso al panel web).

| Rol | Descripción | Capacidades |
|---|---|---|
| Super Admin | Dueño o CEO de la firma inmobiliaria | Acceso total a todos los grupos de trabajo, usuarios, configuración global y reportes consolidados |
| Admin | Administrador de propiedades | Acceso a las propiedades de su grupo de trabajo, gestión de contratos, financiero y mantenimiento |
| Analista | Rol de solo lectura + registro | Puede ver toda la información de su grupo y crear registros, pero no puede eliminar ni aprobar |

#### 2.2.2 Endpoints de Autenticación Restaurados

```
POST /api/v1/auth/login           → Recibe {email, password}, retorna {access_token, refresh_token, user}
POST /api/v1/auth/refresh         → Renueva access_token con refresh_token (HttpOnly cookie)
POST /api/v1/auth/logout          → Invalida tokens y limpia cookie
GET  /api/v1/auth/me              → Perfil del admin autenticado
POST /api/v1/auth/forgot-password → Envía email de recuperación
POST /api/v1/auth/reset-password  → Cambia contraseña con token de recuperación
```

- Pantalla de login: `/login.html`
- Redirección post-login: `/dashboard.html`
- Protección de rutas: middleware JS verifica token antes de cargar cualquier página

---

### 2.3 Fix: Descarga de PDFs de Contratos

Los contratos se generan correctamente pero no se pueden descargar. El problema está en el endpoint y en el frontend.

```python
# routers/contracts.py
from fastapi.responses import StreamingResponse
import io

@router.get("/{contract_id}/download")
async def download_contract_pdf(
    contract_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = await contract_service.get_contract(db, contract_id)
    pdf_bytes = await pdf_service.generate_contract_pdf(contract, ...)

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            # CRÍTICO: "attachment" fuerza descarga, "inline" abre en el browser
            "Content-Disposition": f'attachment; filename="contrato_{contract_id}.pdf"'
        }
    )
```

```javascript
// Fix en el frontend (assets/js/pages/contracts.js)
async function downloadContract(contractId) {
    const response = await fetch(`/api/v1/contracts/${contractId}/download`, {
        headers: { 'Authorization': `Bearer ${api.accessToken}` }
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contrato_${contractId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
}
```

---

## 3. Módulo de Grupos de Trabajo y Auditoría

### 3.1 Concepto de Grupos de Trabajo

Un Grupo de Trabajo es un conjunto de usuarios administradores que comparten acceso a un mismo portafolio de propiedades.

**Ejemplo:** 3 administradores gestionan las mismas 10 propiedades → pertenecen al mismo grupo y ven exactamente la misma información.

| Sin Grupos de Trabajo | Con Grupos de Trabajo |
|---|---|
| ❌ Usuario A ve solo SUS propiedades | ✅ Grupo "Portafolio Centro" comparte 10 propiedades |
| ❌ No hay colaboración entre admins | ✅ Todos ven contratos, gastos y tareas en tiempo real |
| ❌ Duplicación de esfuerzo | ✅ Auditoría de quién hizo cada acción |

### 3.2 Esquema de Base de Datos — Grupos

| Tabla | Columnas Principales | Descripción |
|---|---|---|
| `work_groups` | id, name, description, super_admin_id, created_at | Grupos de trabajo. Cada grupo tiene un Super Admin. |
| `work_group_members` | id, work_group_id, user_id, role, joined_at | Membresía de usuarios en grupos con rol específico. |
| `work_group_properties` | id, work_group_id, property_id, added_at | Propiedades asignadas a cada grupo. |
| `audit_logs` | id, user_id, work_group_id, action, entity_type, entity_id, old_value, new_value, ip_address, created_at | Log inmutable de todas las acciones del sistema. |

### 3.3 Sistema de Auditoría Completo

| Categoría | Acciones Auditadas | Datos Capturados |
|---|---|---|
| Usuarios | login, logout, crear, editar, desactivar | IP, user-agent, timestamp, resultado |
| Propiedades | crear, editar, eliminar, cambiar estado | Valores anteriores y nuevos (JSON diff) |
| Financiero | crear transacción, editar, anular | Monto, cuenta, categoría, usuario, IP |
| Contratos | crear, activar, finalizar, generar PDF | Estado anterior, nuevo, usuario que aprueba |
| Mantenimiento | crear orden, cambiar estado, completar | Costo estimado vs real, proveedor asignado |
| Grupos | agregar/remover miembro, agregar/remover propiedad | Usuario afectado, grupo, quien hizo el cambio |

```python
# utils/audit.py — Decorator de auditoría automática
from functools import wraps

def audit_action(action: str, entity_type: str):
    """Decorator que registra automáticamente la acción en audit_logs."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            db = kwargs.get("db")
            current_user = kwargs.get("current_user")
            result = await func(*args, **kwargs)
            await AuditLog.create(
                db,
                user_id=current_user.id,
                action=action,
                entity_type=entity_type,
                entity_id=str(result.id if hasattr(result, "id") else ""),
            )
            return result
        return wrapper
    return decorator

# Uso:
@audit_action("CONTRACT_ACTIVATED", "contract")
async def activate_contract(db, contract_id, current_user): ...
```

### 3.4 UI — Etiquetas de Usuario en Registros

En toda la interfaz, los registros mostrarán etiquetas de auditoría visibles:

- **Creado por** `[nombre]` — `[fecha]` (en gris suave bajo cada tarjeta)
- **Modificado por** `[nombre]` — `[fecha]` (cuando hay ediciones)
- **Eliminado por** `[nombre]` — `[fecha]` (registros con soft delete)
- En tablas de listado: columna **"Última Acción"** con ícono de usuario y tooltip con detalle completo.

---

## 4. Módulo Facility Management + Bot de Telegram

### 4.1 Arquitectura de la Integración

El bot de Telegram actúa como canal de entrada para arrendatarios. Ellos **nunca acceden al panel web** — toda su interacción es a través de Telegram. Las órdenes creadas vía Telegram se sincronizan automáticamente con el módulo de Facility Management del PMS.

```
ARRENDATARIO (Telegram)         BOT PYTHON                    PMS Backend
─────────────────────────────────────────────────────────────────────────
1. Envía mensaje de texto    →  Recibe update                →  -
2. Envía fotografía(s)       →  Descarga foto de Telegram    →  Sube a /uploads/telegram/
3. Envía audio/voz           →  Descarga audio               →  Whisper API transcribe
4. Confirma el reporte       →  -                            →  POST /api/v1/maintenance/from-telegram
5. Recibe número de ticket   ←  Envía confirmación           ←  Retorna {ticket_id, status}
6. Recibe actualizaciones    ←  Bot notifica cambios         ←  Webhook o polling de estado
```

### 4.2 Stack del Bot de Telegram

| Componente | Tecnología | Propósito |
|---|---|---|
| Framework del Bot | `python-telegram-bot` 21.x (async) | Manejo de mensajes, comandos y callbacks |
| Transcripción de Audio | OpenAI Whisper API (`whisper-1`) | Convierte mensajes de voz a texto en español |
| Almacenamiento Fotos | Sistema de archivos + referencia en DB | Fotos en `uploads/telegram/{ticket_id}/` |
| Comunicación con PMS | `httpx` (cliente HTTP async) | Llama API interna del PMS para crear órdenes |
| Persistencia del Bot | Redis (sesiones de conversación) | Guarda estado del flujo por `chat_id` |
| Despliegue | Webhook HTTPS (prod) / Polling (dev) | Recepción de actualizaciones de Telegram |

### 4.3 Flujo Conversacional del Bot

```
/start          → Bienvenida + solicitar número de unidad
/reportar       → Iniciar reporte de problema (flujo multi-paso)
/mis_ordenes    → Consultar estado de órdenes activas
/cancelar       → Cancelar el flujo actual en cualquier momento

FLUJO /reportar (estado guardado en Redis por chat_id):
  Paso 1: "¿En qué área tiene el problema?" → [Baño] [Cocina] [Eléctrico] [Otro]
  Paso 2: "Describe el problema en detalle" → texto libre
  Paso 3: "¿Puedes enviar fotos?" → acepta hasta 5 fotos o /saltar
  Paso 4: "¿Quieres agregar una nota de voz?" → acepta audio o /saltar
  Paso 5: Resumen + confirmación → [✅ Confirmar] [✏️ Editar]
  Paso 6: Crea la orden en el PMS → "Tu ticket es #MT-2025-0147"
```

### 4.4 Estructura de Archivos del Bot

```
pms-telegram-bot/
├── bot.py                    # Punto de entrada, webhook/polling
├── config.py                 # Settings (TELEGRAM_TOKEN, PMS_API_URL, etc.)
├── handlers/
│   ├── start.py              # /start y registro de arrendatario
│   ├── report.py             # Flujo /reportar (ConversationHandler)
│   ├── status.py             # /mis_ordenes
│   └── media.py              # Procesamiento de fotos y audios
├── services/
│   ├── pms_client.py         # Cliente HTTP para llamar API del PMS
│   ├── whisper_service.py    # Transcripción de audio con Whisper
│   └── redis_session.py      # Gestión de estado conversacional
├── requirements.txt
└── Dockerfile
```

### 4.5 Transcripción de Audio con Whisper

```python
# services/whisper_service.py
import openai
import tempfile
from pathlib import Path

async def transcribe_telegram_audio(file_bytes: bytes) -> str:
    """Transcribe audio de Telegram a texto en español."""
    client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    with open(tmp_path, "rb") as audio_file:
        transcript = await client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="es",          # forzar español
            response_format="text"
        )

    Path(tmp_path).unlink()         # limpiar archivo temporal
    return transcript

# Nota: Costo de Whisper API ~$0.006 USD/minuto.
# Alternativa gratuita: Whisper local → pip install openai-whisper
```

### 4.6 Schema del Endpoint de Órdenes desde Telegram

```python
# schemas/maintenance.py
class TelegramMaintenanceCreate(BaseModel):
    telegram_chat_id: str                    # ID del chat de Telegram
    unit_identifier: str                     # Número de unidad del arrendatario
    area: str                                # Área del problema
    description: str                         # Descripción del problema
    audio_transcription: str | None = None   # Texto transcrito del audio
    photo_paths: list[str] = []              # Rutas a las fotos guardadas

# El endpoint POST /api/v1/maintenance/from-telegram:
# 1. Identifica la propiedad por unit_identifier
# 2. Crea la MaintenanceOrder: tipo=Correctivo, status=Pendiente, source=Telegram
# 3. Vincula las fotos a la orden
# 4. Genera número de ticket: MT-{AÑO}-{CORRELATIVO}
# 5. Notifica por email al administrador del grupo
# 6. Retorna {ticket_id, ticket_number, property_name}
```

---

## 5. Sistema de Notificaciones Email Automáticas

### 5.1 Eventos que Disparan Emails

| Evento | Destinatario(s) | Plantilla | Adjunto |
|---|---|---|---|
| Contrato activado | Arrendatario + Propietario | `contract_activated` | PDF del contrato |
| Enlace de firma enviado | Arrendatario | `contract_sign_request` | PDF del contrato |
| Contrato firmado | Admin + Propietario | `contract_signed` | PDF firmado |
| Vencimiento de contrato (<90 días) | Admin + Arrendatario | `contract_expiry_warning` | — |
| Orden de mantenimiento creada | Admin del grupo | `maintenance_new` | — |
| Orden de mantenimiento completada | Propietario | `maintenance_completed` | Factura PDF |
| Alerta de presupuesto excedido | Admin + Propietario | `budget_exceeded` | — |
| Pago de canon registrado | Arrendatario | `payment_received` | Recibo PDF |
| Carta de terminación generada | Arrendatario + Admin | `contract_termination` | PDF carta |

### 5.2 Configuración Gmail SMTP (Gratuito)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notificaciones@tuempresa.com   # cuenta Gmail dedicada
SMTP_PASSWORD=xxxx xxxx xxxx xxxx        # App Password de Google (no la contraseña normal)
EMAIL_FROM_NAME=PMS — Gestión Inmobiliaria

# Cómo crear App Password:
# 1. Activar verificación en 2 pasos en la cuenta Gmail
# 2. Cuenta Google → Seguridad → Contraseñas de aplicaciones
# 3. Crear contraseña para "Correo" → copiar aquí

# Alternativa gratuita con mayor volumen:
# Resend.com → 3.000 emails/mes gratis → RESEND_API_KEY=re_xxxx
```

```python
# services/email_service.py
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from jinja2 import Environment, FileSystemLoader

async def send_contract_activation_email(
    contract, tenant, property, pdf_bytes: bytes
) -> bool:
    env = Environment(loader=FileSystemLoader("templates/emails/"))
    html_body = env.get_template("contract_activated.html").render(
        tenant_name=tenant.full_name,
        property_name=property.name,
        start_date=contract.start_date.strftime("%d de %B de %Y"),
        monthly_rent=f"${contract.monthly_rent:,.0f}",
        sign_url=f"{settings.APP_URL}/sign/{contract.sign_token}",
    )
    message = MessageSchema(
        subject=f"Su contrato de arrendamiento — {property.name}",
        recipients=[tenant.email],
        body=html_body,
        subtype="html",
        attachments=[{
            "content": pdf_bytes,
            "filename": "contrato.pdf",
            "type": "application/pdf"
        }]
    )
    await FastMail(mail_config).send_message(message)
    return True
```

### 5.3 Firma Electrónica Simple

1. El email incluye resumen del contrato + PDF adjunto + botón **"Firmar Contrato"**.
2. El enlace lleva a `/sign/{token}` — página pública con el PDF embebido y formulario de aceptación.
3. El arrendatario escribe su nombre completo y cédula, y hace clic en **"Acepto las condiciones"**.
4. Se registra: nombre, cédula, IP, user-agent, timestamp → contrato pasa a estado `Firmado`.
5. Email de confirmación a admin y propietario con datos de la firma.

---

## 6. Mejoras al Módulo de Propiedades

### 6.1 Métricas Avanzadas de Propiedades

| Métrica | Fórmula / Fuente | Visualización |
|---|---|---|
| ROI Bruto Anual | `(Ingresos Año / Valor Comercial) × 100` | Badge % + tendencia |
| Cap Rate | `(NOI Anual / Valor Comercial) × 100` | Badge % + semáforo |
| NOI (Net Operating Income) | `Ingresos Brutos - Gastos Operativos` | Número en COP |
| Tasa de Ocupación (12 meses) | `(Días Arrendado / 365) × 100` | Barra de progreso |
| Costo por m² | `Gastos Totales Año / Área m²` | Número + comparativo portafolio |
| Días Promedio de Vacancia | Promedio de días sin arrendar entre contratos | Número de días |
| Cashflow Mensual Neto | `Canon - Gastos mes actual` | Tarjeta verde/roja |
| Rendimiento vs Portafolio | ROI propiedad vs ROI promedio del portafolio | Gráfico comparativo |
| Valor Estimado de Renta (VER) | Canon actual vs canon sugerido por m² de zona | Indicador de mercado |

### 6.2 Pestaña de Arrendatarios en la Ficha de Propiedad

Nueva pestaña **"Arrendatarios"** junto a las pestañas existentes (Resumen, Financiero, Mantenimiento, Documentos).

**Sección 1 — Arrendatario Actual:**
- Avatar + Nombre completo + cédula
- Teléfono, email, Telegram (si está vinculado al bot)
- Fecha inicio / fecha vencimiento / días restantes del contrato
- Canon mensual + método de pago habitual
- Estado de pagos: `✅ Al día` / `⚠️ 5 días de mora` / `🔴 15+ días mora`
- Botones: "Ver Contrato" | "Enviar Mensaje Telegram" | "Registrar Pago"

**Sección 2 — Historial de Arrendatarios:**
- Tabla con todos los contratos históricos de la propiedad
- Columnas: Nombre, Período, Canon, Duración, Estado de salida
- Indicador: Tiempo promedio de arrendamiento en esta propiedad

**Sección 3 — Score de Cumplimiento del Arrendatario Actual:**
- % de pagos a tiempo (últimos 12 meses)
- Número de órdenes de mantenimiento generadas
- Incidentes o notas del administrador

---

## 7. Módulo de Documentos Legales (Colombia)

### 7.1 Carta de Terminación de Contrato

#### 7.1.1 Marco Legal — Causales de Terminación (Ley 820/2003)

| Causal de Terminación | Preaviso Requerido | Base Legal |
|---|---|---|
| Por mutuo acuerdo | Sin preaviso mínimo | Art. 22 Ley 820/2003 |
| Por arrendador — no renovación sin justa causa | 3 meses de anticipación | Art. 22 literal c |
| Por arrendador — incumplimiento del arrendatario | Mediante proceso judicial | Art. 22 literal a |
| Por arrendatario — terminación anticipada con preaviso | 3 meses o pago de indemnización | Art. 24 Ley 820/2003 |
| Por arrendatario — incumplimiento del arrendador | 1 mes de anticipación escrita | Art. 25 Ley 820/2003 |
| Por arrendador — reparaciones urgentes | 30 días mínimo | Art. 22 literal f |
| Por venta del inmueble | 3 meses de anticipación | Art. 22 literal g |

#### 7.1.2 Variables de Plantilla `carta_terminacion.html`

```jinja2
{{ arrendador_nombre }}        {# del modelo User (propietario) #}
{{ arrendador_cedula }}
{{ arrendatario_nombre }}      {# del modelo User (arrendatario) #}
{{ arrendatario_cedula }}
{{ propiedad_direccion }}      {# de Property.address #}
{{ ciudad }}                   {# de Property.city #}
{{ fecha_inicio }}             {# de Contract.start_date #}
{{ fecha_terminacion }}        {# calculada según causal + preaviso #}
{{ causal_terminacion }}       {# seleccionada por el admin en UI #}
{{ base_legal }}               {# artículo correspondiente — automático #}
{{ valor_canon }}              {# Contract.monthly_rent formateado #}
{{ condiciones_entrega }}      {# texto libre del admin #}
{{ ciudad_elaboracion }}
{{ fecha_elaboracion }}        {# automática: hoy #}
```

---

### 7.2 Módulo de Inventarios de Propiedad

#### 7.2.1 Esquema de Base de Datos

| Tabla | Columnas Clave | Descripción |
|---|---|---|
| `property_inventories` | id, property_id, contract_id, inventory_type, date, notes, created_by | Cabecera del inventario. Tipos: Ingreso, Salida, Verificación. |
| `inventory_items` | id, inventory_id, category, item_name, condition, quantity, notes | Ítem individual del inventario con su estado actual. |
| `inventory_photos` | id, inventory_item_id, photo_path, caption, uploaded_at | Fotos asociadas a cada ítem del inventario. |

#### 7.2.2 Categorías e Items del Inventario

| Categoría | Ítems Típicos | Estados Posibles |
|---|---|---|
| Estructura | Paredes, pisos, techo, ventanas, puertas | Excelente / Bueno / Regular / Malo / No Aplica |
| Eléctrico | Tomas, interruptores, lámparas, breakers | Funciona / Con defecto / No funciona |
| Plomería | Llaves de agua, sanitarios, ducha, lavaplatos | Funciona / Con defecto / No funciona |
| Cocina | Muebles, estufa, campana, nevera (si aplica) | Excelente / Bueno / Regular / Malo |
| Mobiliario | Closets, divisiones, muebles incluidos | Excelente / Bueno / Regular / Malo |
| Exterior | Parqueadero, jardín, piscina, terraza | Excelente / Bueno / Regular / Malo |

#### 7.2.3 Estructura del PDF de Inventario

```
PÁGINA 1: Portada
  ├── Nombre y dirección de la propiedad
  ├── Tipo de inventario: Ingreso / Salida / Verificación
  ├── Fecha y responsable del inventario
  └── Contrato asociado (si aplica)

PÁGINAS 2-N: Ítems por Categoría
  ├── Título de la categoría (ej: "Baño Principal")
  ├── Tabla: Ítem | Estado | Cantidad | Observaciones
  └── Fotos en cuadrícula (2 por fila, con caption)

PÁGINA FINAL: Firmas
  ├── "Entregado por:" + espacio firma + cédula del arrendador/admin
  ├── "Recibido por:" + espacio firma + cédula del arrendatario
  └── Fecha y lugar de la firma
```

---

## 8. Módulo de Scoring de Riesgo del Arrendatario

### 8.1 Variables del Modelo de Scoring

| Variable | Tipo | Peso | Descripción |
|---|---|---|---|
| `monthly_income` | Decimal | 30% | Ingreso mensual declarado (bruto) |
| `income_type` | Enum | 20% | Empleado formal / Independiente / Pensionado / Rentista |
| `employment_months` | Integer | 15% | Meses en el empleo/actividad actual |
| `has_cosigner` | Boolean | 15% | Cuenta con codeudor o fiador |
| `rent_to_income_ratio` | Calculado | — | Canon / Ingreso mensual (ideal ≤ 30%) |
| `previous_evictions` | Boolean | 10% | Antecedentes de lanzamientos previos |
| `credit_report_status` | Enum | 5% | Sin reporte / Sin mora / Con mora / Castigado |
| `references_count` | Integer | 5% | Número de referencias verificadas |
| `has_rental_insurance` | Boolean | Bonus | Si el candidato cuenta con seguro de arrendamiento |

### 8.2 Algoritmo de Cálculo del Score

```python
# services/risk_scoring_service.py

def calculate_tenant_risk_score(data: TenantScoringInput) -> ScoringResult:
    score = 0
    alerts = []

    # 1. RATIO CANON/INGRESO (máx 30 puntos)
    ratio = data.monthly_rent / data.monthly_income
    if ratio <= 0.30:    score += 30
    elif ratio <= 0.35:  score += 20
    elif ratio <= 0.40:  score += 10
    else:                alerts.append("Canon supera el 40% del ingreso — RIESGO ALTO")

    # 2. TIPO DE INGRESO (máx 20 puntos)
    income_scores = {
        "Empleado_Formal": 20, "Pensionado": 18,
        "Independiente": 12,   "Rentista": 10
    }
    score += income_scores.get(data.income_type, 5)

    # 3. ANTIGÜEDAD LABORAL (máx 15 puntos)
    if data.employment_months >= 24:    score += 15
    elif data.employment_months >= 12:  score += 10
    elif data.employment_months >= 6:   score += 5
    else:                               alerts.append("Menos de 6 meses en empleo actual")

    # 4. CODEUDOR (máx 15 puntos)
    if data.has_cosigner:  score += 15
    else:                  alerts.append("Sin codeudor — incrementa el riesgo")

    # 5. ANTECEDENTES (hasta -20 puntos)
    if data.previous_evictions:
        score -= 20
        alerts.append("ALERTA: Antecedentes de lanzamiento previo")

    # 6. REPORTE DE CRÉDITO
    credit_scores = {
        "Sin_reporte": 5, "Sin_mora": 5,
        "Con_mora": -5,   "Castigado": -15
    }
    score += credit_scores.get(data.credit_report_status, 0)

    # 7. BONUS: Seguro de arrendamiento
    if data.has_rental_insurance:  score += 5

    # Clasificar riesgo
    score = max(0, min(100, score))
    if score >= 70:    risk_level = "BAJO"    # 🟢
    elif score >= 50:  risk_level = "MEDIO"   # 🟡
    else:              risk_level = "ALTO"    # 🔴

    return ScoringResult(score=score, risk_level=risk_level, alerts=alerts)
```

### 8.3 Tabla de Resultados

| Resultado | Puntaje | Recomendación |
|---|---|---|
| 🟢 RIESGO BAJO | 70 - 100 pts | Arrendatario con buen perfil financiero. Se recomienda proceder. |
| 🟡 RIESGO MEDIO | 50 - 69 pts | Perfil aceptable con reservas. Solicitar codeudor o seguro adicional. |
| 🔴 RIESGO ALTO | 0 - 49 pts | Perfil de alto riesgo. No se recomienda arrendar sin garantías adicionales. |

---

## 9. Módulo de Seguros de Arrendamiento

### 9.1 Catálogo de Seguros para Colombia

| Aseguradora / Producto | Cobertura | Qué Incluye | Costo Aprox. |
|---|---|---|---|
| Mapfre — Seguro de Arrendamiento | Rentas + Daños | Cánones impagos (hasta 6 meses) + daños al inmueble | 4% - 6% del canon anual |
| Seguros Bolívar — Póliza de Arrendamiento | Rentas | Cánones impagos + proceso de lanzamiento | 3% - 5% del canon anual |
| Allianz Colombia — Seguro Inmobiliario | Rentas + Daños + Servicios | Cánones + administración + daños estructurales | 5% - 8% del canon anual |
| Sura — Seguro de Arrendamiento | Rentas | Cánones impagos hasta por 12 meses | 4% - 6% del canon anual |
| Liberty Seguros — Renta Segura | Rentas + Daños | Cánones + daños causados por arrendatario | 4% - 7% del canon anual |
| AXA Colpatria — Arrendamiento | Rentas | Cánones + servicios públicos impagos | 3% - 5% del canon anual |
| Inmobiliaria como garante | Garantía administrativa | La inmobiliaria responde directamente | Negociado caso a caso |
| Sin seguro | Sin cobertura | El propietario asume el riesgo total | $0 |

### 9.2 Modelo de Datos del Módulo de Seguros

| Tabla | Columnas Clave | Descripción |
|---|---|---|
| `insurance_policies` | id, property_id, contract_id, insurer_name, policy_number, coverage_type, annual_premium, start_date, end_date, status, documents_path | Póliza de seguro vinculada a una propiedad y/o contrato. |
| `insurance_coverage_items` | id, policy_id, coverage_name, max_coverage_amount, deductible | Coberturas individuales dentro de una póliza. |
| `insurance_claims` | id, policy_id, claim_date, claim_type, amount_claimed, status, resolution_notes | Reclamaciones realizadas contra una póliza. |

### 9.3 Indicadores en el Dashboard de la Propiedad

- Badge visible en ficha: `"Asegurada ✅"` (verde) o `"Sin Seguro ⚠️"` (naranja).
- En módulo de scoring: bonus de +5 puntos si la propiedad tiene seguro vigente.
- Alerta automática 60 días antes del vencimiento de la póliza (Celery task).
- Reporte consolidado: cuántas propiedades del portafolio tienen seguro vs. no.
- Costo anual de seguros incluido en el cálculo del NOI y cashflow proyectado.

---

## 10. Cambios en el Esquema de Base de Datos (v1.0 → v2.0)

### 10.1 Tablas Nuevas a Crear

| Tabla Nueva | Módulo | Migración Alembic |
|---|---|---|
| `work_groups` | Grupos de Trabajo | `create_work_groups_table` |
| `work_group_members` | Grupos de Trabajo | `create_work_group_members_table` |
| `work_group_properties` | Grupos de Trabajo | `create_work_group_properties_table` |
| `audit_logs` | Auditoría | `create_audit_logs_table` |
| `telegram_tenants` | Telegram Bot | `create_telegram_tenants_table` |
| `property_inventories` | Inventarios | `create_property_inventories_table` |
| `inventory_items` | Inventarios | `create_inventory_items_table` |
| `inventory_photos` | Inventarios | `create_inventory_photos_table` |
| `tenant_scorings` | Scoring de Riesgo | `create_tenant_scorings_table` |
| `insurance_policies` | Seguros | `create_insurance_policies_table` |
| `insurance_coverage_items` | Seguros | `create_insurance_coverage_items_table` |
| `insurance_claims` | Seguros | `create_insurance_claims_table` |
| `email_notifications` | Notificaciones | `create_email_notifications_table` |
| `contract_signatures` | Firma contratos | `create_contract_signatures_table` |
| `termination_letters` | Cartas terminación | `create_termination_letters_table` |

### 10.2 Tablas Existentes con Modificaciones

| Tabla Existente | Columnas a Agregar | Motivo |
|---|---|---|
| `users` | work_group_id (FK), last_login, login_attempts | Grupos de trabajo + seguridad |
| `properties` | has_insurance (bool), risk_score_avg, telegram_unit_id | Seguros + scoring + Telegram |
| `maintenance_orders` | source (enum: Manual/Telegram), telegram_chat_id, telegram_message_id, has_photos | Integración Telegram |
| `contracts` | sign_token (uuid), signed_at, signer_ip, signer_name, sign_method | Firma electrónica |
| `contracts` | termination_reason, termination_date, termination_letter_id | Carta de terminación |
| `transactions` | work_group_id (FK), audit_log_id | Trazabilidad de grupo |

### 10.3 Orden de Ejecución de Migraciones

1. Verificar conexión DB: `alembic current`
2. `create_work_groups_table` → `create_work_group_members_table` → `create_work_group_properties_table`
3. `create_audit_logs_table`
4. `add_work_group_id_to_users` → `add_insurance_fields_to_properties`
5. `create_telegram_tenants_table` → `add_telegram_fields_to_maintenance`
6. `add_sign_fields_to_contracts` → `create_contract_signatures_table`
7. `create_termination_letters_table`
8. `create_property_inventories_table` → `create_inventory_items_table` → `create_inventory_photos_table`
9. `create_tenant_scorings_table`
10. `create_insurance_policies_table` → `create_insurance_coverage_items_table` → `create_insurance_claims_table`
11. `create_email_notifications_table`
12. Verificar: `alembic current` → debe mostrar `"head"`

---

## 11. Nuevos Endpoints de API (v2.0)

| Método | Endpoint | Descripción | Módulo |
|---|---|---|---|
| POST | `/auth/login` | Login restaurado — email + password | Auth |
| POST | `/auth/logout` | Logout + invalidar tokens | Auth |
| GET | `/auth/me` | Perfil del admin autenticado | Auth |
| GET | `/work-groups` | Listar grupos de trabajo del admin | Grupos |
| POST | `/work-groups` | Crear nuevo grupo de trabajo | Grupos |
| POST | `/work-groups/{id}/members` | Agregar miembro al grupo | Grupos |
| DELETE | `/work-groups/{id}/members/{user_id}` | Remover miembro del grupo | Grupos |
| POST | `/work-groups/{id}/properties` | Asignar propiedad al grupo | Grupos |
| GET | `/audit-logs` | Historial de auditoría con filtros | Auditoría |
| POST | `/maintenance/from-telegram` | Crear orden desde bot Telegram | Telegram |
| GET | `/contracts/{id}/download` | Descargar PDF del contrato (fix) | Contratos |
| POST | `/contracts/{id}/send-for-signature` | Enviar contrato por email + firma | Contratos |
| GET | `/sign/{token}` | Página pública de firma (sin auth) | Contratos |
| POST | `/sign/{token}/accept` | Registrar aceptación de firma | Contratos |
| POST | `/contracts/{id}/termination-letter` | Generar carta de terminación PDF | Legal |
| GET | `/contracts/{id}/termination-letter/download` | Descargar carta PDF | Legal |
| GET | `/properties/{id}/inventories` | Listar inventarios de la propiedad | Inventarios |
| POST | `/properties/{id}/inventories` | Crear nuevo inventario | Inventarios |
| POST | `/inventories/{id}/items` | Agregar ítem al inventario | Inventarios |
| POST | `/inventories/{id}/items/{item_id}/photos` | Subir foto de ítem | Inventarios |
| GET | `/inventories/{id}/download` | Descargar PDF del inventario | Inventarios |
| POST | `/tenants/score` | Calcular scoring de riesgo | Scoring |
| GET | `/tenants/{id}/scores` | Historial de scorings del arrendatario | Scoring |
| GET | `/properties/{id}/insurance` | Pólizas de seguro de la propiedad | Seguros |
| POST | `/properties/{id}/insurance` | Registrar nueva póliza | Seguros |
| POST | `/insurance/{id}/claims` | Registrar reclamación de seguro | Seguros |
| GET | `/properties/{id}/metrics` | Métricas avanzadas de la propiedad | Métricas |
| GET | `/properties/{id}/tenants-tab` | Datos para pestaña de arrendatarios | Propiedades |

---

## 12. Plan de Implementación v2.0

### 12.1 Fases y Prioridades

| Fase | Descripción | Duración | Dependencias |
|---|---|---|---|
| **FASE A** — Correcciones P0 | Reconexión BD + restauración login + fix PDF | 1 semana | Ninguna — **empezar aquí** |
| **FASE B** — Grupos y Auditoría | Grupos de trabajo + auditoría + etiquetas UI | 1.5 semanas | Fase A completa |
| **FASE C** — Telegram Bot | Bot completo + Whisper + integración API | 2 semanas | Fase A completa |
| **FASE D** — Email + Firma | Notificaciones automáticas + firma electrónica | 1 semana | Fase A + contratos |
| **FASE E** — Legal Docs | Cartas de terminación + inventarios + PDFs | 2 semanas | Fase A + PDF service |
| **FASE F** — Scoring + Seguros | Scoring de riesgo + módulo de seguros | 1.5 semanas | Fase B completa |
| **FASE G** — Mejoras UI | Métricas avanzadas + pestaña arrendatarios | 1 semana | Fases A-F |
| **FASE H** — QA y Despliegue | Testing integral + correcciones + despliegue | 1 semana | Todas las fases |

### 12.2 Variables de Entorno Nuevas Requeridas

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=          # Token del BotFather de Telegram
TELEGRAM_WEBHOOK_URL=        # URL pública HTTPS del webhook (producción)

# Transcripción de Audio
OPENAI_API_KEY=              # Para Whisper API (vacío si usa Whisper local)

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=               # App Password de Google

# Firma Electrónica
APP_URL=https://pms.tudominio.com
SIGN_TOKEN_EXPIRE_HOURS=72

# Redis (para bot + Celery)
REDIS_URL=redis://localhost:6379/0

# Seguridad (mantener de v1.0)
SECRET_KEY=                  # mínimo 32 caracteres aleatorios
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### 12.3 Prompt Inicial para el Agente de Antigravity

```
Contexto: Este proyecto es el PMS (Property Management System), una aplicación web
de gestión inmobiliaria construida con FastAPI (backend) y Vanilla JS + Tailwind (frontend).

PRIORIDAD INMEDIATA — Ejecutar en este orden:

1. DIAGNÓSTICO COMPLETO: Revisar TODOS los archivos del proyecto e identificar:
   - Por qué la BD está desconectada (revisar database.py, config.py, .env, models/__init__.py)
   - Si existe o fue eliminado el módulo de login (routers/auth.py, login.html)
   - Estado actual de los endpoints de descarga de PDF
   → Generar reporte de issues encontrados ANTES de hacer cualquier cambio.

2. Leer el documento ETS-PMS-002 completo antes de escribir código.

3. Ejecutar la FASE A completa antes de proceder a cualquier nueva funcionalidad.

4. Para cada fase completada, ejecutar /review antes de continuar con la siguiente.

Stack: FastAPI + SQLAlchemy 2.x async + PostgreSQL/SQLite + Pydantic v2
Reglas en: .agent/rules/ — SIEMPRE seguirlas al escribir código.
```

---

> **ETS-PMS-002** | Documento de Actualización PMS v2.0
> Complementa ETS-PMS-001 v1.0 — todos los estándares originales permanecen vigentes.
> **Estado: APROBADO PARA DESARROLLO | 2025**
