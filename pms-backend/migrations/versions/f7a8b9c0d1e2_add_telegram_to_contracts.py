"""Add telegram_chat_id and signed_document to contracts

Revision ID: f7a8b9c0d1e2
Revises: 5256d79ba758
Create Date: 2026-03-28 11:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f7a8b9c0d1e2'
down_revision: Union[str, None] = '5256d79ba758'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('contracts', schema=None) as batch_op:
        batch_op.add_column(sa.Column('tenant_telegram_chat_id', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('signed_document_path', sa.String(length=500), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('contracts', schema=None) as batch_op:
        batch_op.drop_column('signed_document_path')
        batch_op.drop_column('tenant_telegram_chat_id')
