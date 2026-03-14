"""Add period_type to budgets

Revision ID: 9921c86a8e6c
Revises: c063ce5cfde3
Create Date: 2026-03-14 10:28:33.843465

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9921c86a8e6c'
down_revision: Union[str, None] = 'c063ce5cfde3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('budgets', schema=None) as batch_op:
        batch_op.add_column(sa.Column('period_type', sa.String(length=50), nullable=False, server_default='Mensual'))


def downgrade() -> None:
    with op.batch_alter_table('budgets', schema=None) as batch_op:
        batch_op.drop_column('period_type')
