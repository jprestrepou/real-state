
import asyncio
from app.database import engine
from sqlalchemy import text

async def check_columns():
    async with engine.connect() as conn:
        res = await conn.execute(text("PRAGMA table_info(properties)"))
        columns = [row[1] for row in res.fetchall()]
        print("COLUMNS:")
        for col in columns:
            print(col)

if __name__ == "__main__":
    asyncio.run(check_columns())
