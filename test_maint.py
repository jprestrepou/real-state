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
        from app.database import engine, Base
        import uuid
        
        # Ensure tables exist
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        user = (await db.execute(select(User))).scalars().first()
        prop = (await db.execute(select(Property))).scalars().first()
        
        if not user or not prop:
            # Create mock user and prop
            user = User(id=str(uuid.uuid4()), email="test@test.com", password_hash="hash", full_name="Test", role="Admin", is_active=True)
            prop = Property(id=str(uuid.uuid4()), name="Test Prop", address="123", city="Pop", property_type="Casa", owner_id=user.id, latitude=0, longitude=0, area_sqm=100.0)
            db.add(user)
            db.add(prop)
            await db.commit()
        
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
