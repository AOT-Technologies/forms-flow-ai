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
    
PERMISSION_DETAILS = [
    {"name": Permissions.CREATE_DESIGNS, "description": "Create Form, workflow designs", "depends_on": [Permissions.VIEW_DESIGNS]},
    {"name": Permissions.VIEW_DESIGNS, "description": "Access to design", "depends_on": []},
    {"name": Permissions.CREATE_SUBMISSIONS, "description": "Create submissions", "depends_on": []},
    {"name": Permissions.VIEW_SUBMISSIONS, "description": "Access to submissions", "depends_on": []},
    {"name": Permissions.VIEW_DASHBOARDS, "description": "Access to dashboards", "depends_on": []},
    {"name": Permissions.VIEW_TASKS, "description": "Access to tasks", "depends_on": []},
    {"name": Permissions.MANAGE_TASKS, "description": "Can claim and work on tasks", "depends_on": [Permissions.VIEW_TASKS]},
    {"name": Permissions.MANAGE_ALL_FILTERS, "description": "Manage all filters", "depends_on": [Permissions.VIEW_FILTERS, Permissions.CREATE_FILTERS]},
    {"name": Permissions.CREATE_FILTERS, "description": "Access to create filters", "depends_on": [Permissions.VIEW_FILTERS]},
    {"name": Permissions.VIEW_FILTERS, "description": "Access to view filters", "depends_on": []},
    {"name": Permissions.MANAGE_INTEGRATIONS, "description": "Access to Integrations", "depends_on": []},
    {"name": Permissions.MANAGE_DASHBOARD_AUTHORIZATIONS, "description": "Manage Dashboard Authorization", "depends_on": [Permissions.VIEW_DASHBOARDS]},
    {"name": Permissions.MANAGE_USERS, "description": "Manage Users", "depends_on": []},
    {"name": Permissions.MANAGE_ROLES, "description": "Manage Roles", "depends_on": [Permissions.MANAGE_USERS]},
    {"name": Permissions.ADMIN, "description": "Administrator Role", "depends_on": []},
]
