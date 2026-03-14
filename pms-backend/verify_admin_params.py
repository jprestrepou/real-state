
import asyncio
import uuid
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.property import Property, PropertyType
from app.models.user import User

async def verify_property_admin_params():
    print("Testing Property Administration Parameters...")
    async with AsyncSessionLocal() as db:
        # 1. Get or create a test user
        result = await db.execute(select(User).limit(1))
        test_user = result.scalar_one_or_none()
        if not test_user:
            print("No test user found, creating one...")
            test_user = User(
                id=str(uuid.uuid4()),
                email=f"test_{uuid.uuid4().hex[:6]}@example.com",
                full_name="Test User",
                hashed_password="...",
                role="Admin"
            )
            db.add(test_user)
            await db.commit()
        
        # 2. Create a property with admin params
        prop_id = str(uuid.uuid4())
        new_prop = Property(
            id=prop_id,
            owner_id=test_user.id,
            name="Test Apartamento Admin",
            property_type=PropertyType.APARTAMENTO.value,
            address="Calle Falsa 123",
            city="Bogotá",
            latitude=4.711,
            longitude=-74.072,
            area_sqm=65.0,
            commercial_value=300000000,
            administration_fee=250000,
            pays_administration=True,
            administration_day=5,
            administration_payment_method="Transferencia",
            administration_payment_info="Cuenta Ahorros 123456",
            status="Disponible"
        )
        db.add(new_prop)
        await db.commit()
        print(f"Property created: {prop_id}")

        # 3. Verify params
        await db.refresh(new_prop)
        assert new_prop.pays_administration == True
        assert new_prop.administration_day == 5
        assert float(new_prop.administration_fee) == 250000.0
        assert new_prop.administration_payment_method == "Transferencia"
        print("Verification successful: All parameters saved and retrieved correctly.")

        # Cleanup
        await db.delete(new_prop)
        await db.commit()
        print("Cleanup complete.")

if __name__ == "__main__":
    asyncio.run(verify_property_admin_params())
