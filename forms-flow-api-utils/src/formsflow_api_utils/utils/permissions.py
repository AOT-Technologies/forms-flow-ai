"""Permission definitions."""
from enum import Enum

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
MANAGE_DASHBOARD_AUTHORIZATIONS = "manage_dashboard_authorizations"
MANAGE_USERS = "manage_users"
MANAGE_ROLES = "manage_roles"
REVIEWER_VIEW_HISTORY = "reviewer_view_history"
SUBMISSION_VIEW_HISTORY = "submission_view_history"
ASSIGN_TASK_TO_OTHERS = "assign_task_to_others"
MANAGE_ADVANCE_FLOWS = "manage_advance_workflows"
MANAGE_TEMPLATES = "manage_templates"
MANAGE_BUNDLES = "manage_bundles"
MANAGE_INTEGRATIONS = "manage_integrations"
ANALYZE_METRICS_VIEW = "analyze_metrics_view"
ANALYZE_SUBMISSIONS_VIEW = "analyze_submissions_view"
ANALYZE_SUBMISSIONS_VIEW_HISTORY = "analyze_submissions_view_history"
ANALYZE_PROCESS_VIEW = "analyze_process_view"
MANAGE_LINKS = "manage_links"
ADMIN = "admin"
CREATE_BPMN_FLOWS = "create_bpmn_flows"
MANAGE_SUBFLOWS = "manage_subflows"
MANAGE_DECISION_TABLES = "manage_decision_tables"
REVIEWER_PROCESS_VIEW = "reviewer_process_view"

class permission_category(Enum):
    """Enumerations for permission categories."""

    TASKS = "TASKS"
    DESIGN = "DESIGN"
    SUBMIT = "SUBMIT"
    ANALYZE = "ANALYZE"
    ADMIN = "ADMIN"

PERMISSION_DETAILS = [
    {"name": VIEW_TASKS, "description": "View tasks", "category": permission_category.TASKS.value, "order": 10, "depends_on": [ VIEW_FILTERS ]},
    {"name": MANAGE_TASKS, "description": "Work on tasks (assign to themselves + complete tasks)", "category": permission_category.TASKS.value, "order": 20, "depends_on": [ VIEW_FILTERS, VIEW_TASKS]},
    {"name": ASSIGN_TASK_TO_OTHERS, "description": "Assign/re-assign tasks to anybody within the group", "category": permission_category.TASKS.value, "order": 30, "depends_on": [ VIEW_FILTERS, VIEW_TASKS, MANAGE_TASKS ]},
    {"name": REVIEWER_VIEW_HISTORY, "description": "View task history", "category": permission_category.TASKS.value, "order": 40, "depends_on": [VIEW_FILTERS, VIEW_TASKS]},
    # {"name": REVIEWER_PROCESS_VIEW, "description": "View process diagram in task", "category": permission_category.TASKS.value, "order": 41, "depends_on": [VIEW_FILTERS, VIEW_TASKS, REVIEWER_VIEW_HISTORY]},
    {"name": VIEW_FILTERS, "description": "View filters",  "category": permission_category.TASKS.value, "order": 50, "depends_on": [ VIEW_TASKS ]},
    {"name": CREATE_FILTERS, "description": "Manage personal filters",  "category": permission_category.TASKS.value, "order": 60, "depends_on": [ VIEW_FILTERS ]},
    {"name": MANAGE_ALL_FILTERS, "description": "Manage all shared filters (delete and edit filters others shared, excluding private filters)",  "category": permission_category.TASKS.value, "order": 70, "depends_on": [ VIEW_FILTERS , CREATE_FILTERS ]},
    {"name": VIEW_DESIGNS, "description": "View forms & flows", "category": permission_category.DESIGN.value, "order": 10, "depends_on": []},
    {"name": CREATE_DESIGNS, "description": "Manage forms & flows you create and that are shared with you", "category": permission_category.DESIGN.value, "order": 20, "depends_on": [ VIEW_DESIGNS ]},
    {"name": MANAGE_ADVANCE_FLOWS, "description": "Manage advance flows (BPMNs + SubFlows + Decision Tables)", "category": permission_category.DESIGN.value, "order": 30, "depends_on": [ VIEW_DESIGNS ]},
    {"name": MANAGE_TEMPLATES, "description": "Manage templates", "category": permission_category.DESIGN.value, "order": 40, "depends_on": [ CREATE_DESIGNS, VIEW_DESIGNS ]},
    {"name": MANAGE_BUNDLES, "description": "Manage bundles", "category": permission_category.DESIGN.value, "order": 50, "depends_on": [ CREATE_DESIGNS, VIEW_DESIGNS ]},
    {"name": MANAGE_INTEGRATIONS, "description": "Manage integrations", "category": permission_category.DESIGN.value, "order": 60, "depends_on": []},
    {"name": CREATE_SUBMISSIONS, "description": "Manage submissions (create, save drafts, resubmit)", "category": permission_category.SUBMIT.value, "order": 10, "depends_on": [VIEW_SUBMISSIONS]},
    {"name": VIEW_SUBMISSIONS, "description": "View their own past submissions", "category": permission_category.SUBMIT.value, "order": 20, "depends_on": []},
    {"name": SUBMISSION_VIEW_HISTORY, "description": "View submission history", "category": permission_category.SUBMIT.value, "order": 30, "depends_on": [VIEW_SUBMISSIONS]},
    {"name": ANALYZE_METRICS_VIEW, "description": "View metrics", "category": permission_category.ANALYZE.value, "order": 10, "depends_on": []},
    {"name": VIEW_DASHBOARDS, "description": "View dashboards", "category": permission_category.ANALYZE.value, "order": 20, "depends_on": []},
    {"name": ANALYZE_SUBMISSIONS_VIEW, "description": "View submissions", "category": permission_category.ANALYZE.value, "order": 30, "depends_on": []},
    {"name": ANALYZE_SUBMISSIONS_VIEW_HISTORY, "description": "View submissions history", "category": permission_category.ANALYZE.value, "order": 40, "depends_on": [ ANALYZE_SUBMISSIONS_VIEW ]},
    {"name": ANALYZE_PROCESS_VIEW, "description": "View submissions process diagram", "category": permission_category.ANALYZE.value, "order": 50, "depends_on": [ ANALYZE_SUBMISSIONS_VIEW, ANALYZE_SUBMISSIONS_VIEW_HISTORY ]},
    {"name": MANAGE_USERS, "description": "Users", "category": permission_category.ADMIN.value, "order": 10, "depends_on": []},
    {"name": MANAGE_ROLES, "description": "Roles", "category": permission_category.ADMIN.value, "order": 20, "depends_on": []},
    {"name": MANAGE_DASHBOARD_AUTHORIZATIONS, "description": "Dashboards", "category": permission_category.ADMIN.value, "order": 30, "depends_on": []},
    # {"name": MANAGE_LINKS, "description": "Links", "category": permission_category.ADMIN.value, "order": 40, "depends_on": []}
]


def build_permission_dict():
    """
    Builds a dictionary of permissions where the key is the permission name and 
    the value is the permission detail.

    Returns:
        dict: A dictionary of permission details.
    """
    return {permission["name"]: permission for permission in PERMISSION_DETAILS}
