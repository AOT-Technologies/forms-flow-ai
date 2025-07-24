
import argparse
from utils import get_access_token, get_client_id, add_client_roles, update_client_role, role_changes_710, get_group_id, get_client_roles, assign_roles_to_group, get_groups, get_sub_groups
from typing import List

# Roles to be added, removed, or updated for the forms-flow-web client
roles_to_add, roles_to_remove, roles_to_update = role_changes_710()

def _migrate_tenants(tenant_keys: List[str]):
    """Update the tenant client by adding new permissions, revising permission descriptions, and removing unused roles.

    Args:
        tenant_keys (List[str]): List of tenant keys
    """
    try:
        token = get_access_token()
        print("Access token retrieved successfully. ")
        
        for tenant_key in tenant_keys:
            client_id = get_client_id(token, f"{tenant_key}-forms-flow-web")
            add_client_roles(token, client_id, roles_to_add)
            update_client_role(token, client_id, roles_to_update)
    except Exception as e:
        print(f"Error: {e}")

def _migrate_default_groups(token, client_id, client_roles):
    """Migrate new roles to default groups"""
    try:      

        # Define default groups and their new role mappings
        default_groups_to_role_mappings = {
            "formsflow/formsflow-client": [
                "submission_view_history"
            ],
            "formsflow/formsflow-designer": [
                "manage_advance_workflows",
                "manage_bundles",
                "manage_templates"
            ],
            "formsflow/formsflow-reviewer": [
                "assign_task_to_others",
                "reviewer_view_history",
                "manage_all_filters",
                "analyze_metrics_view",
                "analyze_submissions_view",
                "analyze_submissions_view_history",
                "analyze_process_view"
            ]
        }

        # Add new roles to default groups
        for group in default_groups_to_role_mappings.keys():
            group_id = get_group_id(token, group)
            if not group_id:
                print(f"Group {group} not found, skipping and continuing the migration.")
                continue
            roles = []
            add_roles = default_groups_to_role_mappings.get(group)
            print(f"Updating {group} with roles : {add_roles}")
            for role in add_roles:
                for client_role in client_roles:
                    if client_role['name'] == role:
                        roles.append(client_role)
            assign_roles_to_group(token, group_id, client_id, roles)
    except Exception as e:
        print(f"Error: {e}")

def add_roles_to_custom_groups(group_roles, role_index):
    """Check old role and add corresponding new roles to the group"""
    roles = []
    # Designer roles
    if ("manage_subflows" in group_roles or "manage_decision_tables" in group_roles) and role_index.get("manage_advance_workflows"):
        roles.append(role_index["manage_advance_workflows"])
    if "create_designs" in group_roles:
        roles.extend(
            role for name in ["manage_bundles", "manage_templates"] 
            if (role := role_index.get(name)) is not None
        )
    # Submitter roles
    if "view_submissions" in group_roles and role_index.get("submission_view_history"):
        roles.append(role_index["submission_view_history"])
    # Reviewer roles
    if "manage_tasks" in group_roles and role_index.get("assign_task_to_others"):
        roles.append(role_index["assign_task_to_others"])
    if "view_tasks" in group_roles and role_index.get("reviewer_view_history"): 
        roles.append(role_index["reviewer_view_history"]) # discuss and add - view_tasks also
    # Analyze roles
    if "view_dashboards" in group_roles:
        roles.extend(
            role for name in ["analyze_metrics_view", "analyze_submissions_view", "analyze_submissions_view_history", "analyze_process_view"] 
            if (role := role_index.get(name)) is not None
        )
    return roles

def process_groups_assign_roles(groups, exclude_groups, role_index, token, client_id):
    """Process each custom group and assign new roles."""
    for group in groups:
        if group.get("path") in exclude_groups:
            continue  # Skip excluded groups
        # Fetch client roles specific to the group
        group_roles = group.get("clientRoles").get("forms-flow-web")
        if not group_roles:
            continue  # Skip if no client roles
        print(f"Group: {group.get('path')}")
        roles = add_roles_to_custom_groups(group_roles, role_index)
        # If new roles are found, assign them to the group
        if  roles:
            assign_roles_to_group(token, group.get("id"), client_id, roles)
        if group.get("subGroupCount", 0) > 0:
            sub_groups = get_sub_groups(token, group.get("id"))
            process_groups_assign_roles(sub_groups, exclude_groups, role_index, token, client_id)
    return True

def _migrate_custom_groups(token, client_id, client_roles):
    """Migrate new roles to custom groups"""
    
    groups = get_groups(token)
    exclude_groups = ["/camunda-admin", "/formsflow/formsflow-admin", "/formsflow/formsflow-client", "/formsflow/formsflow-designer", "/formsflow/formsflow-reviewer", "/formsflow-analytics"]
    
    role_index = {role['name']: role for role in client_roles}
    print("Processing custom groups...")
    process_groups_assign_roles(groups, exclude_groups, role_index, token, client_id)           
            
              
def _migrate():
    """Migrate forms-flow-web client roles and group mappings for v7.0.0"""
    token = get_access_token()
    print("Access token retrieved successfully.")

    # Get client ID & client roles
    client_id = get_client_id(token, "forms-flow-web")
    client_roles = get_client_roles(token, client_id)      
    print("Client roles retrieved successfully.")

    _migrate_default_groups(token, client_id,  client_roles)
    _migrate_custom_groups(token, client_id, client_roles)
            
def main(_is_multitenant=False, _tenants_list=None):
    """Main function to handle migration based on multi-tenant or single-tenant mode."""
    if _is_multitenant:
        _migrate_tenants(_tenants_list)
    else:
        _migrate()

if __name__ == "__main__":
    """Main entry point for the migration script."""
    parser = argparse.ArgumentParser(description="Migrate new roles to client and add new roles to default and custom groups.")
    parser.add_argument("--multitenant", type=bool, default=False, help="Enable multi-tenant mode")
    parser.add_argument("--tenants", type=str, help="Comma-separated list of tenant names")
    args = parser.parse_args()
    is_multitenant = args.multitenant
    tenants_list = args.tenants.split(",") if args.tenants else None
    main(_is_multitenant=is_multitenant, _tenants_list=tenants_list)
