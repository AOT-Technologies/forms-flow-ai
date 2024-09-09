"""Script to update existing form history records by inserting values
   into the major_version and minor_version columns.

Revision ID: 9929f234cef0
Revises: ae48e890f2e2
Create Date: 2024-08-28 16:49:12.699755

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9929f234cef0'
down_revision = 'ae48e890f2e2'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    # Get distinct parent_form_ids
    distinct_parent_ids = conn.execute(sa.text(
        "SELECT DISTINCT parent_form_id FROM form_history")).fetchall()

    for parent_id in distinct_parent_ids:
        # Get all rows for this parent_form_id in ascending order by id
        stmt = "SELECT id, change_log FROM form_history WHERE parent_form_id = :parent_id ORDER BY id ASC"
        rows = conn.execute(sa.text(stmt), {"parent_id": parent_id[0]}).mappings().all()

        previous_version = None

        for row in rows:
            change_log = row['change_log']
            current_version = change_log.get('version')

            if current_version:
                major_version = int(current_version.strip('v'))
                previous_version = major_version
            else:
                major_version = previous_version

            if major_version is not None:
                update_stmt ="UPDATE form_history SET minor_version=0, major_version = :major_version WHERE id = :id"
                conn.execute(sa.text(update_stmt), {"major_version": major_version, "id": row['id']})
                

def downgrade():
    # Add downgrade logic if necessary
    pass

