
from utils import get_access_token, get_client_id, add_client_roles, delete_client_role, update_client_role

# New roles to be added to the forms-flow-web client
roles_to_add = [
    {
        "name": "analyze_metrics_view",
        "description": "View metrics",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "analyze_process_view",
        "description": "View submissions process diagram",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "analyze_submissions_view",
        "description": "View submissions",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "analyze_submissions_view_history",
        "description": "View submissions history",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "assign_task_to_others",
        "description": "Assign/re-assign tasks to anybody within the group",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "manage_advance_workflows",
        "description": "Manage advance flows (BPMNs + SubFlows + Decision Tables)",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "manage_bundles",
        "description": "Manage bundles",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "manage_links",
        "description": "View links",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "manage_templates",
        "description": "Manage templates",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "reviewer_view_history",
        "description": "View task history",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "submission_view_history",
        "description": "View submission history",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "reviewer_process_view",
        "description": "View process diagram in task",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    }
]
# Roles to be removed from the forms-flow-web client
roles_to_remove = ["create_bpmn_flows", "manage_subflows", "manage_decision_tables", "admin"]

# Roles to be updated in the forms-flow-web client
# Note: The roles_to_update list contains roles that are being updated with new descriptions.
roles_to_update= [
    {
        "name": "view_designs",
        "description": "View forms & flows"
    },
    {
        "name": "create_designs",
        "description": "Manage forms & flows you create and that are shared with you"
    },
    {
        "name": "view_filters",
        "description": "View filters"
    },
    {
        "name": "manage_integrations",
        "description": "Manage integrations"
    },
    {
        "name": "view_dashboards",
        "description": "View dashboards"
    },
    {
        "name": "manage_tasks",
        "description": "Work on tasks (assign to themselves + complete tasks)"
    },
    {
        "name": "create_submissions",
        "description": "Manage submissions (create, save drafts, resubmit)"
    },
    {
        "name": "create_filters",
        "description": "Manage personal filters"
    },
    {
        "name": "view_tasks",
        "description": "View tasks"
    },
    {
        "name": "manage_dashboard_authorizations",
        "description": "Manage dashboards"
    },
    {
        "name": "view_submissions",
        "description": "View their own past submissions"
    },
    {
        "name": "manage_all_filters",
        "description": "Manage all shared filters (delete and edit filters others shared, excluding private filters)",
    },
    {
        "name": "manage_users",
        "description": "Manage users"
    },
    {
        "name": "manage_roles",
        "description": "Manage roles"
    }  
]

def _migrate_default():
    try:
        token = get_access_token()
        print("Access token retrieved successfully. ")
        # Get client and group IDs
        client_id = get_client_id(token, "forms-flow-web")
        add_client_roles(token, client_id, roles_to_add)
        delete_client_role(token,client_id, roles_to_remove)
        update_client_role(token, client_id, roles_to_update)
        

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    _migrate_default()
