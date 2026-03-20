import asyncio
from sqlalchemy import text
from app.database import engine

async def check():
    async with engine.connect() as conn:
        res = await conn.execute(text("PRAGMA table_info('budgets');"))
        for row in res.fetchall():
            if row[1] == 'property_id':
                print(f"Column: {row[1]}, Type: {row[2]}, NotNull: {row[3]}")

asyncio.run(check())
