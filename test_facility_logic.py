import sys
import os

# Add the backend directory to sys.path
backend_path = os.path.abspath(os.path.join(os.getcwd(), 'pms-backend'))
sys.path.append(backend_path)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.property import Property, PropertyType
from app.models.asset import Asset, AssetStatus
from app.models.inspection import Inspection, InspectionType, InspectionStatus
from app.schemas.asset import AssetCreate
from app.schemas.inspection import InspectionCreate
from app.services import asset_service, inspection_service
import uuid

# Setup in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_facility_logic():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    try:
        # 1. Create a dummy property
        prop = Property(
            id=str(uuid.uuid4()),
            name="Test Apartamento",
            property_type="Apartamento",
            address="Calle 123",
            city="Bogota",
            owner_id=str(uuid.uuid4()),
            latitude=4.6,
            longitude=-74.0,
            area_sqm=50.0
        )
        db.add(prop)
        db.commit()
        
        # 2. Test Asset Service
        asset_data = AssetCreate(
            property_id=prop.id,
            name="Aire Acondicionado LG",
            category="Climatización",
            brand="LG",
            model="CoolMaster 2000",
            status="Operativo"
        )
        asset = asset_service.create_asset(db, asset_data)
        print(f"Asset created: {asset.name} (ID: {asset.id})")
        assert asset.name == "Aire Acondicionado LG"
        
        assets = asset_service.list_assets(db, prop.id)
        assert len(assets) == 1
        print(f"Asset list count: {len(assets)}")
        
        # 3. Test Inspection Service
        insp_data = InspectionCreate(
            property_id=prop.id,
            inspection_type="Preventiva",
            scheduled_date="2026-05-01",
            inspector_name="Inspector Gadget"
        )
        insp = inspection_service.create_inspection(db, insp_data)
        print(f"Inspection created: {insp.inspection_type} (ID: {insp.id})")
        assert insp.inspection_type == "Preventiva"
        
        inspections = inspection_service.list_inspections(db, prop.id)
        assert len(inspections) == 1
        print(f"Inspection list count: {len(inspections)}")
        
        print("\nFacility logic verification SUCCESSFUL!")
        
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

if __name__ == "__main__":
    test_facility_logic()
