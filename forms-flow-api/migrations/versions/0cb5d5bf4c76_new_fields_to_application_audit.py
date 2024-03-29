"""New fields added to application_audit & application

Revision ID: 0cb5d5bf4c76
Revises: e1ccede6ab26
Create Date: 2023-07-20 19:28:30.215725

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0cb5d5bf4c76'
down_revision = 'e1ccede6ab26'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('application', sa.Column('is_resubmit', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('application', sa.Column('event_name', sa.String(length=100), nullable=True))
    op.add_column('application_audit', sa.Column('color', sa.String(length=50), nullable=True))
    op.add_column('application_audit', sa.Column('percentage', sa.Double(), nullable=True))
    op.execute("UPDATE application SET is_resubmit = true, event_name = 'application_resubmitted' WHERE application_status = 'Resubmit'")
    op.execute("UPDATE application SET is_resubmit = true, event_name = 'application_acknowledged' WHERE application_status = 'Awaiting Acknowledgement' ")
    
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('application_audit', 'percentage')
    op.drop_column('application_audit', 'color')
    op.drop_column('application', 'event_name')
    op.drop_column('application', 'is_resubmit')
    # ### end Alembic commands ###
