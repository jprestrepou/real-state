"""add_auto_calculate_to_budget

Revision ID: a2b3c4d5e6f7
Revises: 1eeaa9fd274c
Create Date: 2026-03-07 10:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, None] = '1eeaa9fd274c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    with op.batch_alter_table('budgets', schema=None) as batch_op:
        batch_op.add_column(sa.Column('auto_calculate_total', sa.Boolean(), nullable=False, server_default=sa.text('0')))

def downgrade() -> None:
    with op.batch_alter_table('budgets', schema=None) as batch_op:
        batch_op.drop_column('auto_calculate_total')
