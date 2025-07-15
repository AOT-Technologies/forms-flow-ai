
import argparse
from utils import get_access_token, get_client_id, add_client_roles, delete_client_role, update_client_role, role_changes_710
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
            delete_client_role(token,client_id, roles_to_remove)
            update_client_role(token, client_id, roles_to_update)
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate new roles, removes deprecated ones, and updates role descriptions in the multitenant environment")
    parser.add_argument("--tenants", type=str, help="Comma-separated list of tenant names")
    args = parser.parse_args()
    tenants_list = args.tenants.split(",") if args.tenants else None
    if tenants_list:
        _migrate_tenants(tenants_list)
