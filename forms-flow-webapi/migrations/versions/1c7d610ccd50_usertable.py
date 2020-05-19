"""Usertable

Revision ID: 1c7d610ccd50
Revises: 476f1082fae2
Create Date: 2020-05-19 11:33:19.750661

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1c7d610ccd50'
down_revision = '476f1082fae2'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('user1',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('registered_on', sa.DateTime(), nullable=False),
    sa.Column('admin', sa.Boolean(), nullable=False),
    sa.Column('public_id', sa.String(length=100), nullable=True),
    sa.Column('username', sa.String(length=50), nullable=True),
    sa.Column('password_hash', sa.String(length=100), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email'),
    sa.UniqueConstraint('public_id'),
    sa.UniqueConstraint('username')
    )


def downgrade():
    op.drop_table('user')
