import asyncio
import os
import sys

sys.path.append(os.path.abspath("pms-backend"))

from app.database import AsyncSessionLocal
from app.models.maintenance import MaintenanceOrder
from sqlalchemy import select

async def check_nulls():
    async with AsyncSessionLocal() as db:
        stmt = select(MaintenanceOrder).where(MaintenanceOrder.created_by == None)
        result = await db.execute(stmt)
        null_orders = result.scalars().all()
        print(f"Orders with null created_by: {len(null_orders)}")
        if null_orders:
            for o in null_orders:
                print(f"ID: {o.id}, Title: {o.title}")

if __name__ == "__main__":
    asyncio.run(check_nulls())
