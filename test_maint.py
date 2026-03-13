import asyncio
import os
from pprint import pprint

# Setup paths for python imports
import sys
sys.path.append(os.path.abspath("pms-backend"))

from app.database import AsyncSessionLocal
from app.models.maintenance import MaintenanceOrder
from app.schemas.maintenance import MaintenanceCreate
from app.services.maintenance_service import create_maintenance
from app.schemas.maintenance import MaintenanceResponse
from sqlalchemy import select

async def test_create():
    async with AsyncSessionLocal() as db:
        # Get a user and property to use
        from app.models.user import User
        from app.models.property import Property
        user = (await db.execute(select(User))).scalars().first()
        prop = (await db.execute(select(Property))).scalars().first()
        
        if not user or not prop:
            print("Need user and property in DB.")
            return
            
        data = MaintenanceCreate(
            property_id=prop.id,
            title="Test Error",
            maintenance_type="Correctivo",
            priority="Media",
            estimated_cost=100.0,
        )
        try:
            order = await create_maintenance(db, data, user.id)
            print("Order created:", order.id)
            # Try to validate via Pydantic response
            resp = MaintenanceResponse.model_validate(order)
            print("Response serialized successfully.")
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_create())
