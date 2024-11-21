from utils import get_access_token, get_client_id, update_client_roles, get_group_id, assign_roles_to_group, \
    get_client_roles


def main():
    """Migrate forms-flow-web client roles and group mappings for v7.0.0"""
    try:
        token = get_access_token()
        print("Access token retrieved successfully. ")

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
        client_roles = get_client_roles(token, client_id)
        update_client_roles(token, client_id, roles_to_update)
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
    main()
