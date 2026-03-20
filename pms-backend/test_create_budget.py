import asyncio
import json
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.schemas.budget import BudgetCreate, BudgetCategoryCreate
from app.services.budget_service import create_budget

engine = create_async_engine("sqlite+aiosqlite:///./pms_prod.db", echo=False)
AsyncSessionLocalTest = async_sessionmaker(engine, expire_on_commit=False)

async def test():
    async with AsyncSessionLocalTest() as db:
        payload = {
            "property_id": None,
            "year": 2026,
            "month": 3,
            "total_budget": 0,
            "auto_calculate_total": True,
            "notes": "",
            "categories": [
                {
                    "category_name": "Mantenimiento",
                    "budgeted_amount": 2000000,
                    "is_distributable": True
                },
                {
                    "category_name": "Administracion",
                    "budgeted_amount": 2000000,
                    "is_distributable": True
                }
            ]
        }
        try:
            from pydantic import ValidationError
            data = BudgetCreate(**payload)
            res = await create_budget(db, data)
            print("Success:", res.id)
        except ValidationError as e:
            print("ValidationError:", e.errors())
        except Exception as e:
            print("DB Error:", type(e), str(e))

asyncio.run(test())
