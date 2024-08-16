"""Permission definitions."""

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

PERMISSION_DETAILS = [
    {"name": CREATE_DESIGNS , "description": "Create Form, workflow designs", "depends_on": [ VIEW_DESIGNS ]},
    {"name": VIEW_DESIGNS , "description": "Access to design", "depends_on": []},
    {"name": CREATE_SUBMISSIONS , "description": "Create submissions", "depends_on": []},
    {"name": VIEW_SUBMISSIONS , "description": "Access to submissions", "depends_on": []},
    {"name": VIEW_DASHBOARDS , "description": "Access to dashboards", "depends_on": []},
    {"name": VIEW_TASKS , "description": "Access to tasks", "depends_on": [ VIEW_FILTERS ]},
    {"name": MANAGE_TASKS , "description": "Can claim and work on tasks", "depends_on": [ VIEW_TASKS , VIEW_FILTERS ]},
    {"name": MANAGE_ALL_FILTERS , "description": "Manage all filters", "depends_on": [ VIEW_FILTERS , CREATE_FILTERS ]},
    {"name": CREATE_FILTERS , "description": "Access to create filters", "depends_on": [ VIEW_FILTERS ]},
    {"name": VIEW_FILTERS , "description": "Access to view filters", "depends_on": []},
    {"name": MANAGE_INTEGRATIONS , "description": "Access to Integrations", "depends_on": []},
    {"name": MANAGE_DASHBOARD_AUTHORIZATIONS , "description": "Manage Dashboard Authorization", "depends_on": [ VIEW_DASHBOARDS ]},
    {"name": MANAGE_USERS , "description": "Manage Users", "depends_on": []},
    {"name": MANAGE_ROLES , "description": "Manage Roles", "depends_on": [ MANAGE_USERS ]},
    {"name": ADMIN , "description": "Administrator Role", "depends_on": [ MANAGE_ROLES , MANAGE_USERS ]},
]


def build_permission_dict():
    """
    Builds a dictionary of permissions where the key is the permission name and 
    the value is the permission detail.

    Returns:
        dict: A dictionary of permission details.
    """
    return {permission["name"]: permission for permission in PERMISSION_DETAILS}
