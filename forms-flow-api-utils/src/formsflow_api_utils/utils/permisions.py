"""Permission definitions."""
from enum import Enum

class Permissions(Enum):
    CREATE_DESIGNS = "create_designs"
    VIEW_DESIGNS = "view_designs"
    CREATE_SUBMISSIONS = "create_submissions"
    VIEW_SUBMISSIONS = "view_submissions"
    VIEW_DASHBOARDS = "view_dashboards"
    VIEW_TASKS = "view_tasks"
    MANAGE_TASKS = "manage_tasks"
    MANAGE_ALL_FILTERS = "manage_all_filters"
    CREATE_FILTERS = "create_filters"
    VIEW_FILTERS = "view_filters"
    MANAGE_INTEGRATIONS = "manage_integrations"
    MANAGE_DASHBOARD_AUTHORIZATIONS = "manage_dashboard_authorizations"
    MANAGE_USERS = "manage_users"
    MANAGE_ROLES = "manage_roles"
    ADMIN= "admin"

PERMISSIONS = {perm.name: perm.value for perm in Permissions}

PERMISSION_DETAILS = [
    {"name": Permissions.CREATE_DESIGNS.value, "description": "Create Form, workflow designs", "depends_on": [Permissions.VIEW_DESIGNS.value]},
    {"name": Permissions.VIEW_DESIGNS.value, "description": "Access to design", "depends_on": []},
    {"name": Permissions.CREATE_SUBMISSIONS.value, "description": "Create submissions", "depends_on": []},
    {"name": Permissions.VIEW_SUBMISSIONS.value, "description": "Access to submissions", "depends_on": []},
    {"name": Permissions.VIEW_DASHBOARDS.value, "description": "Access to dashboards", "depends_on": []},
    {"name": Permissions.VIEW_TASKS.value, "description": "Access to tasks", "depends_on": []},
    {"name": Permissions.MANAGE_TASKS.value, "description": "Can claim and work on tasks", "depends_on": [Permissions.VIEW_TASKS.value]},
    {"name": Permissions.MANAGE_ALL_FILTERS.value, "description": "Manage all filters", "depends_on": [Permissions.VIEW_FILTERS.value, Permissions.CREATE_FILTERS.value]},
    {"name": Permissions.CREATE_FILTERS.value, "description": "Access to create filters", "depends_on": [Permissions.VIEW_FILTERS.value]},
    {"name": Permissions.VIEW_FILTERS.value, "description": "Access to view filters", "depends_on": []},
    {"name": Permissions.MANAGE_INTEGRATIONS.value, "description": "Access to Integrations", "depends_on": []},
    {"name": Permissions.MANAGE_DASHBOARD_AUTHORIZATIONS.value, "description": "Manage Dashboard Authorization", "depends_on": [Permissions.VIEW_DASHBOARDS.value]},
    {"name": Permissions.MANAGE_USERS.value, "description": "Manage Users", "depends_on": []},
    {"name": Permissions.MANAGE_ROLES.value, "description": "Manage Roles", "depends_on": [Permissions.MANAGE_USERS.value]},
    {"name": Permissions.ADMIN.value, "description": "Administrator Role", "depends_on": []},
]


def build_permission_dict():
    """
    Builds a dictionary of permissions where the key is the permission name and 
    the value is the permission detail.

    Returns:
        dict: A dictionary of permission details.
    """
    return {permission["name"]: permission for permission in PERMISSION_DETAILS}
