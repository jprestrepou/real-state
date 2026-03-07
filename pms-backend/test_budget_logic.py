import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.join(os.getcwd(), 'pms-backend'))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.budget import Budget
from app.models.property import Property
from app.services import budget_service
from app.schemas.budget import BudgetCreate, BudgetCategoryCreate, BudgetDuplicate

def test_budget_logic():
    db = SessionLocal()
    try:
        # 1. Test "GENERAL" property creation
        print("Testing GENERAL property creation...")
        data = BudgetCreate(
            property_id="GENERAL",
            year=2026,
            month=1,
            total_budget=1200000,
            is_annual=True,
            categories=[
                BudgetCategoryCreate(category_name="Mantenimiento", budgeted_amount=600000, is_distributable=True)
            ]
        )
        
        # This should create 12 budgets
        budgets = budget_service.create_budget(db, data)
        assert isinstance(budgets, list), "Should return a list for annual budget"
        assert len(budgets) == 12, f"Should have created 12 budgets, got {len(budgets)}"
        
        # Verify first budget amount
        first = budgets[0]
        assert float(first.total_budget) == 100000.0, f"Expected 100000, got {first.total_budget}"
        assert first.property_rel.name == "Gastos Generales", f"Expected 'Gastos Generales', got {first.property_rel.name}"
        
        # 2. Test duplication
        print("Testing budget duplication...")
        dup_data = BudgetDuplicate(
            target_year=2027,
            target_month=1,
            percentage_increase=10.0
        )
        
        new_budgets = budget_service.duplicate_budget(db, first.id, dup_data)
        new_budget = new_budgets[0]
        
        assert int(new_budget.year) == 2027
        assert float(new_budget.total_budget) == 110000.0, f"Expected 110000 (10% increase), got {new_budget.total_budget}"
        
        print("All backend tests passed!")

    finally:
        # Cleanup (Optional: delete created test data)
        # For now, let's just rollback or leave it if it's a dev DB
        db.close()

if __name__ == "__main__":
    test_budget_logic()
