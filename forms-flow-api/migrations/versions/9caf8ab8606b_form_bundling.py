"""Form bundling

Revision ID: 9caf8ab8606b
Revises: 7dcad446d35c
Create Date: 2023-02-24 20:05:05.164089

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9caf8ab8606b'
down_revision = '7dcad446d35c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('form_process_mapper', sa.Column('can_bundle', sa.Boolean(), nullable=False, server_default=sa.sql.false()))
    op.add_column('form_process_mapper', sa.Column('is_bundle', sa.Boolean(), nullable=False, server_default=sa.sql.false()))
    op.add_column('form_process_mapper', sa.Column('description', sa.String(length=300), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('form_process_mapper', 'description')
    op.drop_column('form_process_mapper', 'is_bundle')
    op.drop_column('form_process_mapper', 'can_bundle')
    # ### end Alembic commands ###
