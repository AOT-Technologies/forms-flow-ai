
from utils import get_access_token, get_client_id, add_client_roles, delete_client_role, update_client_role, role_changes_710

# Roles to be added, removed, or updated for the forms-flow-web client
roles_to_add, roles_to_remove, roles_to_update = role_changes_710()

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
