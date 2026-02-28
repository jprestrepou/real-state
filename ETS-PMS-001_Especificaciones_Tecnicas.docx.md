

| ESPECIFICACIONES TÉCNICAS Property Management System PMS v1.0 *Sistema Integral de Gestión Inmobiliaria* Versión 1.0  |  Febrero 2025 Documento: ETS-PMS-001 |
| ----- |

# **1\. Introducción y Alcance del Proyecto**

## **1.1 Propósito del Documento**

Este documento define las especificaciones técnicas completas para el desarrollo del Property Management System (PMS), una aplicación web integral diseñada para la administración de carteras de bienes raíces. Sirve como referencia oficial para el equipo de desarrollo, revisores técnicos y stakeholders del proyecto.

## **1.2 Descripción General del Sistema**

El PMS es una plataforma SaaS multiusuario que centraliza la gestión operativa, financiera y legal de propiedades inmobiliarias. Permite a propietarios, gestores y administradores mantener control total sobre sus activos: desde el seguimiento de contratos de arrendamiento hasta la conciliación bancaria en tiempo real.

## **1.3 Objetivos del Sistema**

* Centralizar la información de múltiples propiedades en un único panel de control.

* Automatizar el seguimiento financiero mediante un libro mayor (ledger) con conciliación bancaria automática.

* Gestionar el ciclo de vida completo de contratos de arrendamiento y mantenimientos.

* Generar proyecciones financieras a 12 meses y alertas de desviación presupuestaria.

* Proveer visualización geográfica de activos mediante mapas interactivos.

* Producir documentos legales (contratos PDF) a partir de plantillas dinámicas.

## **1.4 Audiencia del Documento**

| Rol | Responsabilidad en el Proyecto | Secciones Clave |
| :---- | :---- | :---- |
| Tech Lead / Arquitecto | Revisión de arquitectura y decisiones tecnológicas | Secciones 3, 4, 5 |
| Backend Developers | Implementación de API, modelos y lógica de negocio | Secciones 5, 6, 7 |
| Frontend Developers | Implementación de UI, gráficos y mapas | Secciones 5, 8 |
| QA Engineers | Plan de pruebas y validación de requisitos | Secciones 6, 9 |
| Product Owner | Validación funcional y priorización | Secciones 2, 3 |

# **2\. Requisitos Funcionales**

## **2.1 Módulo de Gestión de Propiedades**

### **2.1.1 Ficha Técnica de Propiedad**

Cada propiedad registrada en el sistema debe contar con una ficha técnica completa que incluya todos los atributos necesarios para su identificación y gestión:

| Campo | Tipo de Dato | Requerido | Descripción |
| :---- | :---- | :---- | :---- |
| id | UUID | Sí | Identificador único generado automáticamente |
| nombre | VARCHAR(200) | Sí | Nombre o alias descriptivo de la propiedad |
| tipo | ENUM | Sí | Apartamento, Casa, Local, Bodega, Oficina, Lote |
| direccion | TEXT | Sí | Dirección completa con nomenclatura oficial |
| ciudad / país | VARCHAR | Sí | Ubicación administrativa |
| latitud / longitud | DECIMAL(10,8) | Sí | Coordenadas para mapa interactivo |
| area\_m2 | DECIMAL(10,2) | Sí | Área construida en metros cuadrados |
| habitaciones | INTEGER | No | Número de habitaciones (si aplica) |
| matricula\_inmobiliaria | VARCHAR(50) | No | Número de registro catastral |
| valor\_comercial | DECIMAL(15,2) | No | Avalúo comercial actualizado |
| estado | ENUM | Sí | Disponible, Arrendada, En Mantenimiento, Vendida |
| propietario\_id | UUID FK | Sí | Referencia al usuario propietario |

### **2.1.2 Mapa Interactivo**

| Requisito RF-MAP-01 El sistema debe renderizar un mapa interactivo (Leaflet.js) en el dashboard principal. Cada propiedad registrada aparecerá como un pin con color según su estado: Verde=Disponible, Azul=Arrendada, Naranja=En Mantenimiento. Al hacer clic en un pin se despliega un popup con nombre, estado, valor de arriendo y enlace a la ficha completa. El mapa debe soportar clustering cuando hay múltiples propiedades en la misma zona. |
| :---- |

## **2.2 Módulo de Usuarios y Roles**

El sistema implementa control de acceso basado en roles (RBAC) con tres niveles de privilegio:

| Rol | Descripción | Permisos Principales |
| :---- | :---- | :---- |
| Admin | Administrador del sistema | CRUD completo en todos los módulos, gestión de usuarios, configuración global |
| Propietario | Dueño de propiedades | CRUD en sus propiedades, lectura de reportes financieros, aprobación de mantenimientos |
| Gestor | Gestor inmobiliario | Gestión operativa delegada, registro de transacciones, carga de documentos |

## **2.3 Módulo de Control Financiero (Ledger)**

### **2.3.1 Libro Mayor**

El corazón financiero del sistema es un libro mayor de doble entrada donde cada transacción afecta exactamente dos cuentas: un débito y un crédito. Esto garantiza la integridad contable en todo momento.

| Principio de Conciliación Automática (RF-FIN-01) Cuando se registra un gasto de mantenimiento por $500.000 en la Cuenta Corriente XYZ:   → Débito: Cuenta "Gastos de Mantenimiento" \+$500.000   → Crédito: Cuenta Bancaria "Corriente XYZ" \-$500.000 El saldo de la cuenta bancaria se actualiza en tiempo real de forma automática. |
| :---- |

### **2.3.2 Tipos de Cuentas Bancarias**

* Cuenta Corriente: Para operaciones del día a día y pagos de servicios.

* Cuenta de Ahorros: Para reservas de mantenimiento y fondos de contingencia.

* Cuenta de Inversión: Para rendimientos y activos de capital.

* Caja Menor: Para gastos menores en efectivo.

### **2.3.3 Categorías de Transacciones**

| Categoría | Tipo | Ejemplos |
| :---- | :---- | :---- |
| Ingresos por Arriendo | Ingreso | Cánones mensuales, depósitos de garantía |
| Gastos Mantenimiento | Gasto | Reparaciones, materiales, mano de obra |
| Impuestos y Tasas | Gasto | Predial, valorización, ICA |
| Cuotas de Administración | Gasto | Cuotas condominales mensuales |
| Servicios Públicos | Gasto | Agua, luz, gas, internet |
| Honorarios Gestión | Gasto | Comisiones de administración inmobiliaria |
| Seguros | Gasto | Seguro de incendio, todo riesgo, arrendatario |

## **2.4 Módulo de Mantenimientos**

### **2.4.1 Tipos de Mantenimiento**

* Correctivo: Respuesta a daños o fallas imprevistas. Se activa mediante ticket de solicitud.

* Preventivo: Mantenimientos programados en calendario (cada 6 meses, anual, etc.).

* Mejoras: Proyectos de remodelación o ampliación con presupuesto aprobado.

### **2.4.2 Ciclo de Vida de un Mantenimiento**

| Estado | Descripción | Acción Requerida |
| :---- | :---- | :---- |
| Pendiente | Solicitud creada, sin asignar | Asignar proveedor y fecha |
| En Progreso | Trabajo iniciado | Registrar avances y gastos parciales |
| Esperando Factura | Trabajo finalizado | Cargar factura del proveedor (PDF/imagen) |
| Completado | Factura cargada y aprobada | Registrar transacción en ledger automáticamente |
| Cancelado | Trabajo no realizado | Registrar motivo de cancelación |

## **2.5 Módulo de Pagos e Impuestos**

El sistema mantiene un calendario fiscal y de obligaciones donde se registran todas las fechas de vencimiento. Genera alertas automáticas con 30, 15 y 5 días de anticipación a cada vencimiento.

| Obligación | Frecuencia | Alertas Previas |
| :---- | :---- | :---- |
| Impuesto Predial | Anual / Semestral | 30 días, 15 días, 5 días |
| Impuesto de Valorización | Puntual | 60 días, 30 días |
| Cuota de Administración | Mensual | 5 días |
| Servicios Públicos | Mensual / Bimestral | 7 días |
| Seguro de Inmueble | Anual | 45 días, 15 días |
| Renovación Contrato | Según contrato | 90 días, 60 días, 30 días |

## **2.6 Módulo de Presupuestos y Alertas**

### **2.6.1 Sistema de Semáforo**

| Estados de Ejecución Presupuestaria VERDE   (0% \- 85% ejecutado):    Dentro del presupuesto, sin acción requerida. AMARILLO (86% \- 100% ejecutado): Cerca del límite, requiere revisión y aprobación de gastos adicionales. ROJO    (\>100% ejecutado):       Presupuesto excedido, requiere autorización del propietario. |
| :---- |

## **2.7 Módulo Legal: Generador de Contratos**

El sistema genera contratos de arrendamiento en formato PDF mediante plantillas dinámicas. Las variables del contrato se extraen automáticamente de la ficha de la propiedad, el arrendatario y las condiciones pactadas.

* Contrato de Arrendamiento de Vivienda Urbana (Ley 820 de 2003 \- Colombia).

* Contrato de Arrendamiento Local Comercial.

* Otrosí / Addendum de modificación de contrato.

* Acta de Entrega y Recibo del Inmueble.

# **3\. Arquitectura del Sistema**

## **3.1 Patrón Arquitectónico**

El sistema adopta una arquitectura de capas (Layered Architecture) con separación clara entre presentación, lógica de negocio y persistencia de datos. Se expone una API RESTful que consume el frontend SPA (Single Page Application).

| Stack Tecnológico Seleccionado Backend:     Python 3.11+ con FastAPI (alto rendimiento, tipado estático, OpenAPI automático) ORM:         SQLAlchemy 2.0 con Alembic para migraciones Base de Datos: PostgreSQL 15 (producción) | SQLite (desarrollo local) Frontend:    HTML5 \+ Tailwind CSS 3.x \+ JavaScript ES2022 (Vanilla) Gráficos:    Chart.js 4.x Mapas:       Leaflet.js 1.9.x con tiles de OpenStreetMap PDF:         WeasyPrint o ReportLab para generación de contratos Autenticación: JWT (JSON Web Tokens) con refresh tokens Servidor:    Uvicorn (ASGI) \+ Nginx (reverse proxy) Caché:       Redis (opcional, para sesiones y colas de tareas) Cola de Tareas: Celery \+ Redis para alertas automáticas |
| :---- |

## **3.2 Estructura de Directorios del Proyecto**

| Árbol de Archivos \- Backend (FastAPI) pms-backend/ ├── app/ │   ├── \_\_init\_\_.py │   ├── main.py                     \# Entrada FastAPI, configuración CORS │   ├── config.py                   \# Settings con Pydantic BaseSettings │   ├── database.py                 \# Engine SQLAlchemy, SessionLocal │   ├── dependencies.py             \# Inyección de dependencias (get\_db, get\_current\_user) │   ├── models/                     \# Modelos ORM SQLAlchemy │   │   ├── user.py │   │   ├── property.py │   │   ├── financial.py            \# Account, Transaction, Ledger │   │   ├── maintenance.py │   │   ├── contract.py │   │   ├── budget.py │   │   └── notification.py │   ├── schemas/                    \# Pydantic schemas (request/response) │   │   ├── user.py │   │   ├── property.py │   │   ├── financial.py │   │   ├── maintenance.py │   │   ├── contract.py │   │   └── budget.py │   ├── routers/                    \# Endpoints por módulo │   │   ├── auth.py                 \# /api/v1/auth/login, register, refresh │   │   ├── users.py                \# /api/v1/users │   │   ├── properties.py           \# /api/v1/properties │   │   ├── financial.py            \# /api/v1/accounts, /transactions │   │   ├── maintenance.py          \# /api/v1/maintenance │   │   ├── contracts.py            \# /api/v1/contracts │   │   ├── budgets.py              \# /api/v1/budgets │   │   └── reports.py              \# /api/v1/reports/cashflow, projections │   ├── services/                   \# Lógica de negocio │   │   ├── auth\_service.py │   │   ├── ledger\_service.py       \# Conciliación bancaria │   │   ├── budget\_service.py       \# Semáforo y alertas │   │   ├── projection\_service.py   \# Cash flow 12 meses │   │   ├── pdf\_service.py          \# Generación de contratos PDF │   │   └── notification\_service.py \# Alertas y email │   ├── utils/ │   │   ├── security.py             \# Hash, JWT │   │   └── validators.py │   └── tasks/                      \# Celery async tasks │       ├── celery\_app.py │       └── scheduled\_tasks.py      \# Cron: vencimientos, alertas ├── migrations/                     \# Alembic migrations ├── tests/ │   ├── unit/ │   └── integration/ ├── uploads/                        \# Archivos subidos (facturas, fotos) ├── templates/                      \# Plantillas Jinja2 para PDF │   └── contracts/ ├── .env.example ├── requirements.txt ├── docker-compose.yml └── Dockerfile |
| :---- |

| Árbol de Archivos \- Frontend pms-frontend/ ├── index.html                      \# Dashboard principal ├── assets/ │   ├── css/ │   │   └── styles.css              \# Tailwind compilado \+ custom │   └── js/ │       ├── app.js                  \# Router SPA y estado global │       ├── api.js                  \# Cliente HTTP con interceptors JWT │       ├── components/ │       │   ├── navbar.js │       │   ├── sidebar.js │       │   ├── modal.js │       │   └── toast.js │       ├── pages/ │       │   ├── dashboard.js        \# KPIs \+ mapa \+ gráficos resumen │       │   ├── properties.js       \# Listado y ficha de propiedades │       │   ├── financials.js       \# Ledger y cuentas bancarias │       │   ├── maintenance.js      \# Calendario y tickets │       │   ├── budgets.js          \# Semáforo presupuestario │       │   ├── contracts.js        \# Gestión y generación de contratos │       │   └── reports.js          \# Proyecciones y cash flow │       └── utils/ │           ├── charts.js           \# Factory Chart.js │           ├── map.js              \# Configuración Leaflet │           └── formatters.js       \# Moneda, fechas, porcentajes ├── pages/                          \# Vistas HTML por módulo ├── tailwind.config.js └── package.json |
| :---- |

# **4\. Esquema de Base de Datos**

## **4.1 Diagrama Entidad-Relación (Descripción)**

El esquema sigue un modelo relacional normalizado (3NF). Las entidades principales y sus relaciones son:

* users  ──\< properties (un usuario puede tener muchas propiedades)

* properties ──\< accounts (una propiedad puede tener múltiples cuentas bancarias)

* accounts ──\< transactions (cada cuenta registra múltiples transacciones)

* properties ──\< maintenance\_orders (una propiedad tiene múltiples órdenes de trabajo)

* properties ──\< contracts (una propiedad puede tener contratos históricos)

* contracts ──\< payment\_schedules (cada contrato genera un cronograma de pagos)

* properties ──\< budgets (cada propiedad tiene un presupuesto anual)

## **4.2 Definición de Tablas Principales**

### **Tabla: users**

| Columna | Tipo | Constraints | Descripción |
| :---- | :---- | :---- | :---- |
| id | UUID | PK, DEFAULT gen\_random\_uuid() | Identificador único |
| email | VARCHAR(255) | UNIQUE NOT NULL | Correo electrónico (login) |
| password\_hash | VARCHAR(255) | NOT NULL | Bcrypt hash de la contraseña |
| full\_name | VARCHAR(200) | NOT NULL | Nombre completo del usuario |
| role | ENUM | NOT NULL DEFAULT 'Gestor' | Admin, Propietario, Gestor |
| phone | VARCHAR(20) | NULLABLE | Teléfono de contacto |
| is\_active | BOOLEAN | DEFAULT TRUE | Estado de la cuenta |
| created\_at | TIMESTAMP | DEFAULT NOW() | Fecha de registro |
| updated\_at | TIMESTAMP | DEFAULT NOW() | Última actualización |

### **Tabla: properties**

| Columna | Tipo | Constraints | Descripción |
| :---- | :---- | :---- | :---- |
| id | UUID | PK | Identificador único |
| owner\_id | UUID | FK users(id) NOT NULL | Propietario de la propiedad |
| manager\_id | UUID | FK users(id) NULLABLE | Gestor asignado |
| name | VARCHAR(200) | NOT NULL | Nombre de la propiedad |
| property\_type | ENUM | NOT NULL | Apartamento, Casa, Local, Bodega, Oficina |
| address | TEXT | NOT NULL | Dirección completa |
| city | VARCHAR(100) | NOT NULL | Ciudad |
| country | VARCHAR(100) | DEFAULT Colombia | País |
| latitude | DECIMAL(10,8) | NOT NULL | Coordenada latitud |
| longitude | DECIMAL(11,8) | NOT NULL | Coordenada longitud |
| area\_sqm | DECIMAL(10,2) | NOT NULL | Área en m2 |
| bedrooms | INTEGER | NULLABLE | Número de habitaciones |
| bathrooms | INTEGER | NULLABLE | Número de baños |
| cadastral\_id | VARCHAR(50) | NULLABLE | Matrícula inmobiliaria |
| commercial\_value | DECIMAL(15,2) | NULLABLE | Avalúo comercial |
| status | ENUM | DEFAULT Disponible | Disponible, Arrendada, Mantenimiento, Vendida |
| notes | TEXT | NULLABLE | Observaciones adicionales |
| created\_at | TIMESTAMP | DEFAULT NOW() | Fecha de registro |

### **Tabla: bank\_accounts**

| Columna | Tipo | Constraints | Descripción |
| :---- | :---- | :---- | :---- |
| id | UUID | PK | Identificador único |
| property\_id | UUID | FK properties(id) | Propiedad a la que pertenece |
| account\_name | VARCHAR(200) | NOT NULL | Nombre descriptivo |
| account\_type | ENUM | NOT NULL | Corriente, Ahorros, Inversión, Caja\_Menor |
| bank\_name | VARCHAR(100) | NULLABLE | Nombre de la entidad bancaria |
| account\_number | VARCHAR(50) | NULLABLE | Número de cuenta (cifrado) |
| currency | CHAR(3) | DEFAULT COP | Código ISO de moneda |
| current\_balance | DECIMAL(15,2) | DEFAULT 0 | Saldo actual (calculado) |
| is\_active | BOOLEAN | DEFAULT TRUE | Cuenta activa |

### **Tabla: transactions (Ledger)**

| Columna | Tipo | Constraints | Descripción |
| :---- | :---- | :---- | :---- |
| id | UUID | PK | Identificador único |
| account\_id | UUID | FK bank\_accounts(id) | Cuenta afectada |
| property\_id | UUID | FK properties(id) | Propiedad asociada |
| transaction\_type | ENUM | NOT NULL | Ingreso, Gasto, Transferencia, Ajuste |
| category | VARCHAR(100) | NOT NULL | Categoría del gasto/ingreso |
| amount | DECIMAL(15,2) | NOT NULL | Monto de la transacción |
| direction | ENUM | NOT NULL | Debit, Credit |
| description | TEXT | NOT NULL | Descripción detallada |
| reference\_id | UUID | NULLABLE | Ref a maintenance\_order o contract |
| reference\_type | VARCHAR(50) | NULLABLE | maintenance, contract, manual |
| invoice\_file | VARCHAR(500) | NULLABLE | Ruta al archivo de factura |
| transaction\_date | DATE | NOT NULL | Fecha de la transacción |
| recorded\_by | UUID | FK users(id) | Usuario que registró |
| created\_at | TIMESTAMP | DEFAULT NOW() | Timestamp del registro |

### **Tabla: maintenance\_orders**

| Columna | Tipo | Constraints | Descripción |
| :---- | :---- | :---- | :---- |
| id | UUID | PK | Identificador único |
| property\_id | UUID | FK properties(id) | Propiedad afectada |
| title | VARCHAR(300) | NOT NULL | Título descriptivo del trabajo |
| maintenance\_type | ENUM | NOT NULL | Correctivo, Preventivo, Mejora |
| status | ENUM | NOT NULL | Pendiente, En\_Progreso, Completado, Cancelado |
| priority | ENUM | DEFAULT Media | Urgente, Alta, Media, Baja |
| estimated\_cost | DECIMAL(15,2) | NULLABLE | Costo presupuestado |
| actual\_cost | DECIMAL(15,2) | NULLABLE | Costo final real |
| supplier\_name | VARCHAR(200) | NULLABLE | Nombre del proveedor |
| scheduled\_date | DATE | NULLABLE | Fecha programada |
| completed\_date | DATE | NULLABLE | Fecha de finalización real |
| invoice\_file | VARCHAR(500) | NULLABLE | Ruta factura del proveedor |
| notes | TEXT | NULLABLE | Observaciones y detalles |
| created\_by | UUID | FK users(id) | Usuario creador |

### **Tablas: contracts y payment\_schedules**

| Columna \- contracts | Tipo | Descripción |
| :---- | :---- | :---- |
| id | UUID | Identificador único |
| property\_id | UUID FK | Propiedad arrendada |
| tenant\_id | UUID FK | Usuario arrendatario |
| contract\_type | ENUM | Vivienda, Comercial, Garaje |
| monthly\_rent | DECIMAL(15,2) | Valor mensual del canon |
| deposit\_amount | DECIMAL(15,2) | Depósito de garantía |
| start\_date | DATE | Inicio de vigencia |
| end\_date | DATE | Fin de vigencia |
| auto\_renewal | BOOLEAN | Renovación automática |
| annual\_increment\_pct | DECIMAL(5,2) | Porcentaje de incremento anual (IPC) |
| status | ENUM | Borrador, Activo, Finalizado, Cancelado |
| pdf\_file | VARCHAR(500) | Ruta al contrato generado |

# **5\. Especificación de API REST**

## **5.1 Convenciones Generales**

* Base URL: https://api.pms.app/api/v1

* Autenticación: Bearer Token (JWT) en header Authorization para todos los endpoints protegidos.

* Formato: application/json para request y response bodies.

* Paginación: Parámetros ?page=1\&limit=20 en todos los endpoints de listado.

* Códigos de respuesta: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Validation Error, 500 Server Error.

## **5.2 Endpoints por Módulo**

### **Autenticación**

| Método | Endpoint | Descripción | Auth |
| :---- | :---- | :---- | :---- |
| POST | /auth/register | Registro de nuevo usuario | No |
| POST | /auth/login | Login, retorna access \+ refresh token | No |
| POST | /auth/refresh | Renovar access token | Refresh Token |
| POST | /auth/logout | Invalidar tokens | Sí |
| GET | /auth/me | Perfil del usuario autenticado | Sí |

### **Propiedades**

| Método | Endpoint | Descripción | Rol |
| :---- | :---- | :---- | :---- |
| GET | /properties | Listar propiedades con filtros y paginación | Admin, Propietario |
| POST | /properties | Crear nueva propiedad con ficha técnica | Admin, Propietario |
| GET | /properties/{id} | Obtener ficha completa de una propiedad | Todos |
| PUT | /properties/{id} | Actualizar datos de la propiedad | Admin, Propietario |
| DELETE | /properties/{id} | Desactivar propiedad (soft delete) | Admin |
| GET | /properties/map | Datos GeoJSON para el mapa (lat, lng, estado) | Todos |
| POST | /properties/{id}/images | Cargar imágenes de la propiedad | Admin, Propietario |

### **Financiero (Ledger)**

| Método | Endpoint | Descripción | Rol |
| :---- | :---- | :---- | :---- |
| GET | /accounts | Listar cuentas bancarias por propiedad | Todos |
| POST | /accounts | Crear nueva cuenta bancaria | Admin, Propietario |
| GET | /accounts/{id}/balance | Saldo actual y movimientos | Todos |
| GET | /transactions | Listar transacciones con filtros | Todos |
| POST | /transactions | Registrar transacción (actualiza saldo automáticamente) | Gestor, Admin |
| PUT | /transactions/{id} | Corregir transacción (registra auditoría) | Admin |
| GET | /reports/cashflow | Cash flow proyectado 12 meses | Propietario, Admin |
| GET | /reports/summary | Resumen financiero por propiedad o cartera | Todos |

### **Mantenimientos**

| Método | Endpoint | Descripción | Notas |
| :---- | :---- | :---- | :---- |
| GET | /maintenance | Listar órdenes de trabajo con filtros | Filtrar por status, tipo, fecha |
| POST | /maintenance | Crear nueva orden de mantenimiento | Asigna número de ticket auto |
| GET | /maintenance/{id} | Detalle completo de la orden | Incluye historial de estados |
| PUT | /maintenance/{id}/status | Cambiar estado de la orden | Registra en auditoría |
| POST | /maintenance/{id}/invoice | Cargar factura del proveedor | Archivo PDF o imagen |
| POST | /maintenance/{id}/complete | Completar y registrar gasto en ledger | Transacción automática |
| GET | /maintenance/calendar | Vista calendario (preventivos) | Formato iCalendar / JSON |

# **6\. Lógica de Negocio y Reglas del Sistema**

## **6.1 Motor de Conciliación Bancaria**

El servicio ledger\_service.py implementa la lógica central de conciliación. Cada registro de gasto desencadena el siguiente flujo transaccional:

| Algoritmo de Conciliación (ledger\_service.py) def register\_transaction(db, account\_id, amount, direction, ...):     \# 1\. Obtener saldo actual de la cuenta     account \= db.query(BankAccount).filter\_by(id=account\_id).with\_for\_update().one()     \# 2\. Calcular nuevo saldo     if direction \== "Credit":  \# Egreso         if account.current\_balance \< amount:             raise InsufficientFundsError("Saldo insuficiente")         account.current\_balance \-= amount     elif direction \== "Debit":  \# Ingreso         account.current\_balance \+= amount     \# 3\. Registrar transacción en ledger     transaction \= Transaction(account\_id=account\_id, amount=amount, ...)     db.add(transaction)     \# 4\. Verificar alerta de presupuesto     budget\_service.check\_budget\_alert(db, property\_id, category, amount)     \# 5\. Commit atómico (todo o nada)     db.commit()     return transaction |
| :---- |

## **6.2 Proyección de Cash Flow a 12 Meses**

El servicio projection\_service.py calcula proyecciones basadas en datos históricos y contratos vigentes:

* Ingresos proyectados: Canon de arriendo × meses restantes del contrato \+ incremento IPC esperado.

* Gastos proyectados: Promedio mensual de los últimos 3 meses × 12 \+ mantenimientos preventivos programados.

* Balance neto mensual: Ingresos proyectados \- Gastos proyectados por mes.

* ROI proyectado: (Ingresos anuales \- Gastos anuales) / Valor comercial × 100\.

## **6.3 Generación de Cronograma de Pagos**

Al crear un contrato activo, el sistema genera automáticamente un payment\_schedule con una fila por cada período de pago:

* Fecha de vencimiento: Día del mes pactado en el contrato.

* Monto esperado: Canon \+ ajuste IPC en períodos de renovación anual.

* Estado: Pendiente → Pagado (con referencia a la transacción del ledger).

## **6.4 Sistema de Alertas Automáticas**

| Tipos de Alertas (Celery Beat \- scheduled\_tasks.py) Diariamente a las 08:00 AM, el sistema evalúa:   \[VENCIMIENTOS\]  Impuestos/servicios con fecha \<= hoy \+ 30 días → Alerta nivel WARNING   \[VENCIMIENTOS\]  Impuestos/servicios con fecha \<= hoy \+ 7 días  → Alerta nivel CRITICAL   \[PRESUPUESTO\]   Categorías con ejecución \> 85%                  → Alerta nivel WARNING   \[PRESUPUESTO\]   Categorías con ejecución \> 100%                 → Alerta nivel CRITICAL   \[CONTRATOS\]     Contratos que vencen en \< 90 días               → Alerta nivel INFO   \[PAGO\]          Cuotas de administración sin pagar \> 5 días venc → Alerta nivel WARNING Canales de notificación: In-app (badge contador) \+ Email (SMTP) \+ Webhook (opcional) |
| :---- |

# **7\. Seguridad y Autenticación**

## **7.1 Mecanismo de Autenticación JWT**

| Token | Duración | Almacenamiento | Uso |
| :---- | :---- | :---- | :---- |
| Access Token | 15 minutos | Memoria (JavaScript) | Autorizar cada request API |
| Refresh Token | 7 días | HttpOnly Cookie segura | Renovar access token expirado |

## **7.2 Medidas de Seguridad Implementadas**

* Hashing de contraseñas: Bcrypt con cost factor 12\.

* Protección SQL Injection: Uso exclusivo de ORM con parámetros tipados (SQLAlchemy).

* CORS: Whitelist de dominios permitidos en configuración de FastAPI.

* Rate Limiting: Máximo 100 req/min por IP en endpoints de autenticación.

* Validación de entradas: Pydantic valida y sanitiza todos los datos de entrada.

* Upload seguro: Validación de tipo MIME y tamaño máximo 10MB para archivos.

* Cifrado de datos sensibles: Números de cuenta bancaria cifrados con AES-256.

* Auditoría: Log de todas las operaciones financieras con usuario, IP y timestamp.

# **8\. Especificación del Frontend**

## **8.1 Dashboard Principal**

El dashboard muestra una vista consolidada de toda la cartera con los siguientes componentes:

| Widget | Descripción | Librería |
| :---- | :---- | :---- |
| KPI Cards (4) | Total propiedades, ocupación %, ingreso mes, gastos mes | HTML/CSS Tailwind |
| Mapa Interactivo | Pines de propiedades con clustering y popups | Leaflet.js |
| Gráfico Barras | Ingresos vs Gastos últimos 6 meses | Chart.js \- Bar |
| Gráfico Dona | Distribución por tipo de propiedad | Chart.js \- Doughnut |
| Gráfico Línea | Cash flow proyectado 12 meses | Chart.js \- Line |
| Semáforo Presupuestal | Estado de ejecución por categoría | HTML/CSS custom |
| Timeline de Vencimientos | Próximos 30 días de obligaciones | HTML/CSS Tailwind |
| Alertas Activas | Badge con contador y lista desplegable | HTML/JS vanilla |

## **8.2 Gráfico de Cash Flow Proyectado**

| Configuración Chart.js \- Proyección 12 Meses const cashflowChart \= new Chart(ctx, {   type: "line",   data: {     labels: \["Mar", "Abr", "May", ...\],  // 12 meses     datasets: \[       { label: "Ingresos Proyectados", data: \[...\], borderColor: "\#16A34A", fill: true },       { label: "Gastos Proyectados",   data: \[...\], borderColor: "\#DC2626", fill: true },       { label: "Balance Neto",         data: \[...\], borderColor: "\#2563EB", borderDash: \[5,5\] },     \]   },   options: { responsive: true, plugins: { tooltip: { mode: "index" } } } }); |
| :---- |

## **8.3 Integración Leaflet.js**

| Configuración del Mapa Interactivo const map \= L.map("map-container").setView(\[4.711, \-74.072\], 12); L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {   attribution: "OpenStreetMap contributors" }).addTo(map); // Agrupar pines cercanos const markers \= L.markerClusterGroup(); // Agregar propiedades desde API properties.forEach(p \=\> {   const color \= { "Disponible": "green", "Arrendada": "blue", "Mantenimiento": "orange" }\[p.status\];   const marker \= L.circleMarker(\[p.latitude, p.longitude\], { color })     .bindPopup(\`\<b\>${p.name}\</b\>\<br\>${p.status}\<br\>Canon: $${p.monthly\_rent}\`);   markers.addLayer(marker); }); map.addLayer(markers); |
| :---- |

# **9\. Plan de Implementación**

## **9.1 Fases de Desarrollo**

| Fase | Descripción | Duración | Entregables Clave |
| :---- | :---- | :---- | :---- |
| Fase 0 | Arquitectura y setup: repositorio, CI/CD, DB, Docker, Auth JWT | 1 semana | Entorno dev funcional \+ Auth completa |
| Fase 1 | Módulo de Propiedades: CRUD \+ Mapa Leaflet \+ Ficha técnica | 2 semanas | CRUD propiedades \+ mapa con pines |
| Fase 2 | Módulo Financiero: Ledger, cuentas bancarias, conciliación | 3 semanas | Libro mayor funcional \+ dashboard financiero |
| Fase 3 | Mantenimientos: tickets, estados, carga de facturas, calendario | 2 semanas | Módulo mantenimiento completo |
| Fase 4 | Contratos: generador PDF \+ cronograma de pagos \+ arrendatarios | 2 semanas | Contratos PDF \+ agenda de cobros |
| Fase 5 | Presupuestos y alertas: semáforo \+ Celery \+ notificaciones | 2 semanas | Alertas automáticas \+ semáforo |
| Fase 6 | Reportes: proyecciones, cash flow, Chart.js, exportación Excel | 1 semana | Dashboard analytics completo |
| Fase 7 | QA, seguridad, optimización, documentación final y despliegue | 2 semanas | Sistema en producción |

## **9.2 Estimación de Esfuerzo**

| Rol | Dedicación | Horas Estimadas | Semanas |
| :---- | :---- | :---- | :---- |
| Tech Lead / Arquitecto | 50% | 60h | 3 sem |
| Backend Developer (x2) | 100% c/u | 320h x2 \= 640h | 15 sem |
| Frontend Developer (x1) | 100% | 320h | 15 sem |
| QA Engineer (x1) | 50% | 80h | 8 sem |

# **10\. Requisitos Técnicos y Dependencias**

## **10.1 Backend — requirements.txt**

| Dependencias Python Principales \# Framework y servidor fastapi==0.111.0 uvicorn\[standard\]==0.29.0 python-multipart==0.0.9        \# Upload de archivos \# Base de datos sqlalchemy==2.0.30 alembic==1.13.1 psycopg2-binary==2.9.9          \# PostgreSQL driver aiosqlite==0.20.0               \# SQLite async (dev) \# Autenticación python-jose\[cryptography\]==3.3.0 passlib\[bcrypt\]==1.7.4 \# Validación pydantic==2.7.0 pydantic-settings==2.2.1 \# Generación PDF weasyprint==61.2 jinja2==3.1.4 \# Tareas asíncronas y alertas celery==5.3.6 redis==5.0.4 flower==2.0.1                   \# Monitor Celery (dev) \# Email fastapi-mail==1.4.1 \# Utilidades python-dotenv==1.0.1 httpx==0.27.0 pillow==10.3.0 |
| :---- |

## **10.2 Frontend — package.json**

| Dependencias JavaScript {   "dependencies": {     "chart.js": "^4.4.2",     "leaflet": "^1.9.4",     "leaflet.markercluster": "^1.5.3"   },   "devDependencies": {     "tailwindcss": "^3.4.3",     "autoprefixer": "^10.4.19",     "postcss": "^8.4.38",     "vite": "^5.2.10"   } } |
| :---- |

## **10.3 Infraestructura — docker-compose.yml**

| Servicios Docker para Desarrollo services:   db:     image: postgres:15-alpine     environment: { POSTGRES\_DB: pms\_db, POSTGRES\_USER: pms, POSTGRES\_PASSWORD: pms123 }     ports: \["5432:5432"\]     volumes: \[postgres\_data:/var/lib/postgresql/data\]   redis:     image: redis:7-alpine     ports: \["6379:6379"\]   backend:     build: ./pms-backend     ports: \["8000:8000"\]     depends\_on: \[db, redis\]     environment: { DATABASE\_URL: "postgresql://pms:pms123@db/pms\_db", REDIS\_URL: "redis://redis" }   celery\_worker:     build: ./pms-backend     command: celery \-A app.tasks.celery\_app worker \--loglevel=info     depends\_on: \[db, redis\]   frontend:     build: ./pms-frontend     ports: \["3000:80"\]     depends\_on: \[backend\] |
| :---- |

# **11\. Glosario de Términos**

| Término | Definición |
| :---- | :---- |
| Ledger | Libro mayor contable donde se registran todas las transacciones financieras del sistema. |
| Conciliación Bancaria | Proceso de verificar que el saldo del sistema coincide con el saldo real de la cuenta bancaria. |
| Cash Flow | Flujo de caja: diferencia entre ingresos y gastos en un período determinado. |
| RBAC | Role-Based Access Control: control de permisos basado en el rol del usuario. |
| CRUD | Create, Read, Update, Delete: operaciones básicas sobre entidades de la base de datos. |
| JWT | JSON Web Token: estándar de autenticación sin estado basado en tokens firmados. |
| IPC | Índice de Precios al Consumidor: indicador utilizado para el incremento anual del canon. |
| ORM | Object-Relational Mapping: capa de abstracción para interactuar con la DB usando objetos Python. |
| SPA | Single Page Application: aplicación web que carga una sola página y actualiza contenido dinámicamente. |
| Soft Delete | Eliminación lógica: marcar un registro como inactivo en lugar de borrarlo físicamente. |
| Webhook | Mecanismo para enviar notificaciones HTTP a sistemas externos en tiempo real. |

| Control de Versiones del Documento v1.0 \- Febrero 2025  \- Creación inicial del documento ETS-PMS-001 Próxima revisión: Al finalizar la Fase 2 de desarrollo (Módulo Financiero) Elaborado por: Equipo de Arquitectura de Software Estado: APROBADO PARA DESARROLLO |
| :---- |

