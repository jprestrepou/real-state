"""Add supplier_id to maintenance_orders

Revision ID: c063ce5cfde3
Revises: c5c3f056f573
Create Date: 2026-03-14 09:52:01.314741

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c063ce5cfde3'
down_revision: Union[str, None] = 'c5c3f056f573'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('maintenance_orders', schema=None) as batch_op:
        batch_op.add_column(sa.Column('supplier_id', sa.String(length=36), nullable=True))
        batch_op.create_index(batch_op.f('ix_maintenance_orders_supplier_id'), ['supplier_id'], unique=False)
        batch_op.create_foreign_key('fk_maintenance_supplier', 'contacts', ['supplier_id'], ['id'])

def downgrade() -> None:
    with op.batch_alter_table('maintenance_orders', schema=None) as batch_op:
        batch_op.drop_constraint('fk_maintenance_supplier', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_maintenance_orders_supplier_id'))
        batch_op.drop_column('supplier_id')
