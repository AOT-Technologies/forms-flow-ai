"""Removed select_all_field from mapper table

Revision ID: fdfe787a197c
Revises: 78e2529b7c39
Create Date: 2024-03-27 09:48:57.957044

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fdfe787a197c'
down_revision = '78e2529b7c39'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('form_process_mapper', 'selected_all_field')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('form_process_mapper', sa.Column('selected_all_field', sa.BOOLEAN(), autoincrement=False, nullable=True))
    # ### end Alembic commands ###
