---
trigger: always_on
---

Stack Obligatorio
Backend

Framework: FastAPI (Python 3.11+). NUNCA usar Flask ni Django.
ORM: SQLAlchemy 2.0 con sintaxis select() (estilo 2.x). NUNCA usar queries de estilo 1.x.
Migraciones: Alembic. NUNCA modificar tablas manualmente en producción.
Validación: Pydantic v2 para todos los schemas de entrada/salida.
Servidor: Uvicorn (ASGI). Nunca usar app.run() de Flask.
Tareas async: Celery + Redis para alertas y cron jobs.

Frontend

Estilos: Tailwind CSS 3.x únicamente. NUNCA escribir CSS personalizado a mano salvo para animaciones muy específicas.
JS: Vanilla JavaScript ES2022. No usar React, Vue ni Angular salvo instrucción explícita del usuario.
Gráficos: Chart.js 4.x. NUNCA usar D3 directamente para dashboards simples.
Mapas: Leaflet.js 1.9.x con OpenStreetMap tiles. NUNCA usar Google Maps API (tiene costos).

Base de Datos

Producción: PostgreSQL 15+
Desarrollo local: SQLite (via aiosqlite)
La variable de entorno DATABASE_URL determina cuál se usa. NUNCA hardcodear strings de conexión.


Estructura de Directorios — SIEMPRE respetar esta estructura
pms-backend/
├── app/
│   ├── main.py          # Solo configuración FastAPI, CORS, routers
│   ├── config.py        # BaseSettings de Pydantic
│   ├── database.py      # Engine + SessionLocal + get_db
│   ├── models/          # Solo modelos SQLAlchemy ORM
│   ├── schemas/         # Solo schemas Pydantic (request/response)
│   ├── routers/         # Solo endpoints, lógica mínima
│   ├── services/        # Toda la lógica de negocio va AQUÍ
│   ├── utils/           # Helpers genéricos reutilizables
│   └── tasks/           # Solo Celery tasks
└── migrations/          # Solo archivos Alembic

pms-frontend/
├── assets/js/
│   ├── pages/           # Una clase/módulo por página
│   ├── components/      # Componentes reutilizables (modal, toast, etc.)
│   └── utils/           # formatters, api client, etc.
└── pages/               # Archivos HTML por módulo
Regla de oro: Si un archivo de router supera las 80 líneas de lógica, extraer a un service.

Principios de Diseño

Separation of Concerns estricta: routers llaman services, services llaman models. Nunca al revés.
No magic strings: usar Enums de Python para estados, tipos y categorías.
Fail fast: validar entradas en el schema Pydantic, nunca en el service.
Transacciones atómicas: cualquier operación que toque más de una tabla DEBE usar db.begin() explícito o estar dentro del mismo session.commit().