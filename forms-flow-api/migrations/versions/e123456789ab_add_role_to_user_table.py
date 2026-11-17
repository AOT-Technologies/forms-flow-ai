"""add_role_to_user_table

Revision ID: e123456789ab
Revises: fdfe787a197c
Create Date: 2026-02-04 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "e123456789ab"
# Chain this migration after the latest existing head to avoid multiple-heads.
down_revision = "e85c21a0c08f"
branch_labels = None
depends_on = None


def upgrade():
    """Add role column to user table."""
    op.add_column("user", sa.Column("role", sa.String(), nullable=True))


def downgrade():
    """Drop role column from user table."""
    op.drop_column("user", "role")

