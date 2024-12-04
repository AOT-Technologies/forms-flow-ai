import argparse
from utils import get_access_token, get_client_id, update_client_roles, get_group_id, assign_roles_to_group, \
    get_client_roles, create_group, add_group_membership_mapper, get_users_with_client_role, add_user_to_group
from typing import List

roles_to_update = [
    {
        "name": "manage_users",
        "description": "Manage Users",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "view_designs",
        "description": "Access to design",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "create_designs",
        "description": "Create Form, workflow designs",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "view_filters",
        "description": "Access to view filters",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "manage_roles",
        "description": "Manage Roles",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "manage_integrations",
        "description": "Access to Integrations",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "view_dashboards",
        "description": "Access to dashboards",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "manage_tasks",
        "description": "Can claim and work on tasks",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "create_submissions",
        "description": "Create submissions",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "create_filters",
        "description": "Access to create filters",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "view_tasks",
        "description": "Access to tasks",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "manage_dashboard_authorizations",
        "description": "Manage Dashboard Authorization",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "view_submissions",
        "description": "Access to submissions",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "admin",
        "description": "Administrator Role",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    },
    {
        "name": "manage_all_filters",
        "description": "Manage all filters",
        "composite": False,
        "clientRole": True,
        "attributes": {}
    }
]


def main(_is_multitenant=False, _tenants_list=None):
    """Migrate forms-flow-web client roles and group mappings for v7.0.0"""
    if _is_multitenant:
        _migrate_tenants(_tenants_list)
    else:
        _migrate_default()


def _find_roles(all_roles, selected_roles):
    roles = []
    for selected_role in selected_roles:
        for client_role in all_roles:
            if client_role['name'] == selected_role:
                roles.append(client_role)
    return roles


def _migrate_tenants(tenant_keys: List[str]):
    """
    1. Add new permissions to the client.
    2. Create new groups with the client roles.
    3. migrate users to the new groups
    """
    token = get_access_token()
    print("Access token retrieved successfully. ")

    for tenant_key in tenant_keys:
        client_id = get_client_id(token, f"{tenant_key}-forms-flow-web")
        update_client_roles(token, client_id, roles_to_update)
        # Add group mapper to the client
        add_group_membership_mapper(token, client_id)
        client_roles = get_client_roles(token, client_id)
        # Groups to create. tenantkey-formsflow-reviewer, tenantkey-admin, tenantkey-approver, tenantkey-clerk
        print(f"Creating group {tenant_key}-formsflow-reviewer")
        group_id = create_group(access_token=token, group_name=f'{tenant_key}-formsflow-reviewer')
        assign_roles_to_group(token, group_id, client_id,
                              roles=_find_roles(client_roles, [
                                  "manage_integrations",
                                  "view_filters",
                                  "create_submissions",
                                  "view_tasks",
                                  "create_filters",
                                  "create_designs",
                                  "view_designs",
                                  "view_submissions",
                                  "manage_tasks",
                                  "manage_all_filters",
                                  "view_dashboards"]))
        # Migrate users
        users = get_users_with_client_role(token, client_id, "formsflow-reviewer")
        print(f"Found {len(users)} users with role formsflow-reviewer.")
        # Add users to the group
        for user in users:
            user_id = user["id"]
            print(f"Adding user '{user['username']}' (ID: {user_id}) to group '{tenant_key}-formsflow-reviewer'.")
            add_user_to_group(token, user_id, group_id)

        group_id = create_group(access_token=token, group_name=f'{tenant_key}-client')
        assign_roles_to_group(token, group_id, client_id,
                              roles=_find_roles(client_roles, [
                                  "create_submissions",
                                  "view_submissions"]))
        # Migrate users
        users = get_users_with_client_role(token, client_id, "formsflow-client")
        print(f"Found {len(users)} users with role formsflow-client.")
        # Add users to the group
        for user in users:
            user_id = user["id"]
            print(f"Adding user '{user['username']}' (ID: {user_id}) to group '{tenant_key}-client'.")
            add_user_to_group(token, user_id, group_id)

        group_id = create_group(access_token=token, group_name=f'{tenant_key}-admin')
        assign_roles_to_group(token, group_id, client_id,
                              roles=_find_roles(client_roles, [
                                  "manage_roles",
                                  "manage_users",
                                  "camunda-admin",
                                  "admin",
                                  "manage_dashboard_authorizations"]))
        # Migrate users
        users = get_users_with_client_role(token, client_id, "formsflow-admin")
        print(f"Found {len(users)} users with role formsflow-admin.")
        # Add users to the group
        for user in users:
            user_id = user["id"]
            print(f"Adding user '{user['username']}' (ID: {user_id}) to group '{tenant_key}-admin'.")
            add_user_to_group(token, user_id, group_id)

        group_id = create_group(access_token=token, group_name=f'{tenant_key}-approver')
        assign_roles_to_group(token, group_id, client_id,
                              roles=_find_roles(client_roles, [
                                  "view_filters",
                                  "view_tasks",
                                  "create_filters",
                                  "view_submissions",
                                  "manage_tasks"]))
        # Migrate users
        users = get_users_with_client_role(token, client_id, "approver")
        print(f"Found {len(users)} users with role approver.")
        # Add users to the group
        for user in users:
            user_id = user["id"]
            print(f"Adding user '{user['username']}' (ID: {user_id}) to group '{tenant_key}-approver'.")
            add_user_to_group(token, user_id, group_id)

        group_id = create_group(access_token=token, group_name=f'{tenant_key}-clerk')
        assign_roles_to_group(token, group_id, client_id,
                              roles=_find_roles(client_roles, [
                                  "view_filters",
                                  "view_tasks",
                                  "create_filters",
                                  "view_submissions",
                                  "manage_tasks"]))
        # Migrate users
        users = get_users_with_client_role(token, client_id, "clerk")
        print(f"Found {len(users)} users with role clerk.")
        # Add users to the group
        for user in users:
            user_id = user["id"]
            print(f"Adding user '{user['username']}' (ID: {user_id}) to group '{tenant_key}-clerk'.")
            add_user_to_group(token, user_id, group_id)


def _migrate_default():
    try:
        token = get_access_token()
        print("Access token retrieved successfully. ")

        groups_to_role_mappings = {
            "formsflow/formsflow-admin": [
                "manage_users",
                "manage_roles",
                "manage_dashboard_authorizations",
                "admin"
            ],
            "formsflow/formsflow-client": [
                "create_submissions", "view_submissions"
            ],
            "formsflow/formsflow-designer": [
                "manage_integrations",
                "view_designs",
                "create_designs"
            ],
            "formsflow/formsflow-reviewer": [
                "view_dashboards",
                "manage_tasks",
                "view_tasks",
                "create_filters",
                "view_submissions",
                "view_filters"
            ],
            "formsflow-analytics": [
                "view_dashboards"
            ]
        }

        # Get client and group IDs
        client_id = get_client_id(token, "forms-flow-web")
        update_client_roles(token, client_id, roles_to_update)
        client_roles = get_client_roles(token, client_id)
        print("Client roles updated successfully.")
        print("Starting group update")
        for group_name in groups_to_role_mappings.keys():
            # Assign roles to group
            group_id = get_group_id(token, group_name)
            if not group_id:
                print(f"Group {group_name} not found, skipping and continuing the migration.")
                continue
            roles = []
            roles_to_lookup = groups_to_role_mappings.get(group_name)
            print(f"Updating {group_name} with roles : {roles_to_lookup}")
            for role_to_lookup in roles_to_lookup:
                for client_role in client_roles:
                    if client_role['name'] == role_to_lookup:
                        roles.append(client_role)
            assign_roles_to_group(token, group_id, client_id, roles)
        print("Group roles updated successfully.")

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate forms-flow-web client roles and group mappings for v7.0.0")
    parser.add_argument("--multitenant", type=bool, default=False, help="Enable multi-tenant mode")
    parser.add_argument("--tenants", type=str, default="",
                        help="Comma-separated list of tenant names (for multi-tenant mode)")

    args = parser.parse_args()
    is_multitenant = args.multitenant
    tenants_list = args.tenants.split(",") if args.tenants else None

    main(_is_multitenant=is_multitenant, _tenants_list=tenants_list)
