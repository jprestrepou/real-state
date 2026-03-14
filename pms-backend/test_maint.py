import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.services.maintenance_service import list_maintenance

async def main():
    try:
        async with AsyncSessionLocal() as session:
            orders, total = await list_maintenance(session, limit=5)
            print(f"Total maintenance orders: {total}")
            for o in orders:
                print(f"- {o.id}: {o.title}")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
