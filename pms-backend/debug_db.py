
import asyncio
from app.database import engine
from sqlalchemy import text

async def check_columns():
    async with engine.connect() as conn:
        res = await conn.execute(text("PRAGMA table_info(properties)"))
        columns = res.fetchall()
        for col in columns:
            print(f"Column: {col[1]}, Type: {col[2]}, Nullable: {0 if col[3] else 1}, Default: {col[4]}")

if __name__ == "__main__":
    asyncio.run(check_columns())
