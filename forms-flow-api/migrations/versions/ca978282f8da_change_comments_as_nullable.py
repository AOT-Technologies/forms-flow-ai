"""change comments as nullable

Revision ID: ca978282f8da
Revises: 0b8739ab2097
Create Date: 2020-11-18 00:02:34.126191

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ca978282f8da'
down_revision = '0b8739ab2097'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('form_process_mapper', 'process_key',
               existing_type=sa.String(length=50),
               nullable=True)
    op.alter_column('form_process_mapper', 'process_name',
               existing_type=sa.String(length=100),
               nullable=True)

def downgrade():
    op.alter_column('form_process_mapper', 'process_key',
               existing_type=sa.String(length=50),
               nullable=False)
    op.alter_column('form_process_mapper', 'process_name',
               existing_type=sa.String(length=100),
               nullable=False)
