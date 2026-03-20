"""Fix SQLite property_id NOT NULL

Revision ID: 52a1b941d3ce
Revises: 39a4751a1d99
Create Date: 2026-03-20 15:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


# revision identifiers, used by Alembic.
revision: str = '52a1b941d3ce'
down_revision: Union[str, None] = '39a4751a1d99'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    
    # We only apply the raw SQL fix for SQLite because PostgreSQL successfully applied it earlier 
    # and doesn't suffer from batch alter limitations.
    if conn.dialect.name == 'sqlite':
        op.execute("PRAGMA foreign_keys=OFF")
        
        # 1. Create new table without NOT NULL on property_id
        op.execute('''
            CREATE TABLE budgets_new (
                id VARCHAR(36) NOT NULL, 
                property_id VARCHAR(36), 
                year INTEGER NOT NULL, 
                month INTEGER NOT NULL, 
                period_type VARCHAR(10) NOT NULL, 
                total_budget NUMERIC(15, 2) NOT NULL, 
                total_executed NUMERIC(15, 2) NOT NULL, 
                auto_calculate_total BOOLEAN NOT NULL, 
                notes TEXT, 
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
                PRIMARY KEY (id), 
                FOREIGN KEY(property_id) REFERENCES properties (id)
            )
        ''')
        
        # 2. Copy data
        op.execute('''
            INSERT INTO budgets_new (id, property_id, year, month, period_type, total_budget, total_executed, auto_calculate_total, notes, created_at)
            SELECT id, property_id, year, month, period_type, total_budget, total_executed, auto_calculate_total, notes, created_at FROM budgets
        ''')
        
        # 3. Drop old table
        op.execute('DROP TABLE budgets')
        
        # 4. Rename new table
        op.execute('ALTER TABLE budgets_new RENAME TO budgets')
        
        # 5. Recreate index
        op.execute('CREATE INDEX ix_budgets_property_id ON budgets (property_id)')
        
        op.execute("PRAGMA foreign_keys=ON")


def downgrade() -> None:
    pass
