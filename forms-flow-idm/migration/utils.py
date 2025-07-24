import os

import requests
from dotenv import load_dotenv

load_dotenv()

# Load environment variables
KEYCLOAK_BASE_URL = os.getenv("KEYCLOAK_BASE_URL")
KEYCLOAK_CONTEXT_PATH = os.getenv("KEYCLOAK_CONTEXT_PATH", "auth")
REALM = os.getenv("REALM", "forms-flow-ai")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")


def _get_base_url():
    base_url = KEYCLOAK_BASE_URL.rstrip('/')
    context = KEYCLOAK_CONTEXT_PATH.lstrip('/')
    if context:
        return f"{base_url}/{context}"
    else:
        return f"{base_url}"


def get_access_token():
    """Get an access token using client_credentials."""
    token_url = f"{_get_base_url()}/realms/{REALM}/protocol/openid-connect/token"
    payload = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'client_credentials'
    }
    response = requests.post(token_url, data=payload)
    response.raise_for_status()
    return response.json()['access_token']

def get_request_data(token, url):
    """Get data from a given URL with the provided token."""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    response_json = response.json()
    return response_json

def get_client_id(token, client_name):
    """Retrieve the client ID (UUID) based on the client name."""
    get_client_url = f"{_get_base_url()}/admin/realms/{REALM}/clients?first=0&max=1000&clientId={client_name}&search=true"
    headers = {'Authorization': f"Bearer {token}"}
    response = requests.get(get_client_url, headers=headers)
    response.raise_for_status()

    clients = response.json()
    for client in clients:
        if client['clientId'] == client_name:
            return client['id']
    raise ValueError(f"Client '{client_name}' not found. "
                     f"Please make sure the client ({CLIENT_ID}) have manage-clients role from realm-management, "
                     f"under Service account roles")


def get_client_roles(token, client_id):
    """Return client roles."""
    get_client_role_url = f"{_get_base_url()}/admin/realms/{REALM}/clients/{client_id}/roles"
    headers = {'Authorization': f"Bearer {token}"}
    response = requests.get(get_client_role_url, headers=headers)
    response.raise_for_status()

    return response.json()


def add_client_roles(token, client_id, roles):
    """Add a client's roles."""
    client_url = f"{_get_base_url()}/admin/realms/{REALM}/clients/{client_id}/roles"
    headers = {
        'Authorization': f"Bearer {token}",
        'Content-Type': 'application/json'
    }

    for role in roles:
        print("Adding role : ", role.get("name"))
        response = requests.post(client_url, headers=headers, json=role)
        if response.status_code not in [201, 409]:  # 201 = Created, 409 = Already exists
            print(f"Failed to create role {role}: {response.text}")
        else:
            print("Added role")


def delete_client_role(token, client_id, role_names):
    """Delete a client role."""
    headers = {'Authorization': f"Bearer {token}"}
    for role_name in role_names:
        print(f"Deleting role {role_name}.")
        role_url = f"{_get_base_url()}/admin/realms/{REALM}/clients/{client_id}/roles/{role_name}"
        response = requests.delete(role_url, headers=headers)
        if response.status_code == 204:  # 204 = No content (success)
            print("Deleted role successfully.")
        else:
            print(f"Failed to delete role {role_name}: {response.text}")


def update_client_role(token, client_id, roles):
    """Update the description of a client role."""
    headers = {'Authorization': f"Bearer {token}"}
    for role in roles:
        role_name = role.get("name")
        print("Updating role : ", role.get("name"))
        role_url = f"{_get_base_url()}/admin/realms/{REALM}/clients/{client_id}/roles/{role_name}"
        response = requests.put(role_url, headers=headers, json=role)
        if response.status_code == 204:  # 204 = No content (success)
            print("Updated role successfully.")
        else:
            print(f"Failed to update role {role_name}: {response.text}")    

def get_groups(token):
    """Retrieve all groups in the realm."""
    url = f"{_get_base_url()}/admin/realms/{REALM}/groups?briefRepresentation=false"
    groups = get_request_data(token, url)    
    return groups

def get_sub_groups(token, group_id):
    """Retrieve sub-groups of a given group."""
    if not group_id:
        raise ValueError("Group ID cannot be None or empty.")
    url = f"{_get_base_url()}/admin/realms/{REALM}/groups/{group_id}/children?briefRepresentation=false"
    sub_groups = get_request_data(token, url)    
    return sub_groups

def get_group_id(token, group_name):
    """Retrieve the group ID (UUID) based on the group name."""
    parent_group = group_name.split("/")[0]
    group_url = f"{_get_base_url()}/admin/realms/{REALM}/groups?first=0&max=21&exact=false&global=true&search={parent_group}"
    headers = {'Authorization': f"Bearer {token}"}
    response = requests.get(group_url, headers=headers)
    response.raise_for_status()

    groups = response.json()
    for group in groups:
        if group['path'] == f"/{group_name}":
            return group['id']
        for sub_group in group.get("subGroups"):
            if sub_group['path'] == f"/{group_name}":
                return sub_group['id']
    return None


def check_group_exists(access_token, group_name):
    """Check if a group with the specified name already exists in Keycloak."""
    url = f"{_get_base_url()}/admin/realms/{REALM}/groups"
    headers = {"Authorization": f"Bearer {access_token}"}

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    groups = response.json()
    for group in groups:
        if group["name"] == group_name:
            return group["id"]  # Return the group ID if it exists
    return None


def create_group(access_token, group_name):
    """Create a group in Keycloak if it doesn't already exist."""
    existing_group_id = check_group_exists(access_token, group_name)
    if existing_group_id:
        print(f"Group '{group_name}' already exists with ID: {existing_group_id}. Skipping creation.")
        return existing_group_id

    url = f"{_get_base_url()}/admin/realms/{REALM}/groups"
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    payload = {"name": group_name}

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()

    group_id = check_group_exists(access_token, group_name)
    print(f"Group '{group_name}' created successfully with ID: {group_id}.")
    return group_id


def assign_roles_to_group(token, group_id, client_id, roles):
    """Assign client roles to a group."""
    group_url = f"{_get_base_url()}/admin/realms/{REALM}/groups/{group_id}/role-mappings/clients/{client_id}"

    headers = {
        'Authorization': f"Bearer {token}",
        'Content-Type': 'application/json'
    }

    response = requests.post(group_url, headers=headers, json=roles)
    if response.status_code != 204:  # 204 = No content (success)
        print(f"Failed to assign roles to group: {response.text}")


def check_group_membership_mapper_exists(access_token, client_id, mapper_name="groups"):
    """Check if a Group Membership Mapper already exists for the client."""
    url = f"{_get_base_url()}/admin/realms/{REALM}/clients/{client_id}/protocol-mappers/models"
    headers = {"Authorization": f"Bearer {access_token}"}

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    mappers = response.json()
    for mapper in mappers:
        if mapper["name"] == mapper_name:
            return True  # Mapper already exists
    return False


def add_group_membership_mapper(access_token, client_id):
    """Add a Group Membership Mapper to the client if it doesn't exist."""
    url = f"{_get_base_url()}/admin/realms/{REALM}/clients/{client_id}/protocol-mappers/models"
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

    # Check if the mapper already exists
    if check_group_membership_mapper_exists(access_token, client_id):
        print("Group membership mapper already exists. Skipping creation.")
        return

    # Mapper configuration payload
    payload = {
        "name": "groups",
        "protocol": "openid-connect",
        "protocolMapper": "oidc-group-membership-mapper",
        "consentRequired": False,
        "config": {
            "full.path": "true",  # Include full group path
            "id.token.claim": "true",  # Include in ID Token
            "access.token.claim": "true",  # Include in Access Token
            "userinfo.token.claim": "true",  # Include in UserInfo
            "claim.name": "groups",  # Claim name
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    print("Group membership mapper created successfully.")


def check_client_role_exists(access_token, client_id, role_name):
    """Check if a specific client role exists in Keycloak."""
    url = f"{_get_base_url()}/admin/realms/{REALM}/clients/{client_id}/roles"
    headers = {"Authorization": f"Bearer {access_token}"}

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    roles = response.json()
    for role in roles:
        if role["name"].upper() == role_name.upper():
            return role["name"]  # Role exists
    return None


def get_users_with_client_role(access_token, client_id, role_name):
    """Get all users assigned to a specific client role, if the role exists."""
    # Check if the role exists
    if not (role_name := check_client_role_exists(access_token, client_id, role_name)):
        print(f"Client role '{role_name}' does not exist for client ID {client_id}.")
        return []

    # Fetch users with the specified role
    url = f"{_get_base_url()}/admin/realms/{REALM}/clients/{client_id}/roles/{role_name}/users"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()

    return response.json()


def add_user_to_group(access_token, user_id, group_id):
    """Add a user to a group in Keycloak."""
    url = f"{_get_base_url()}/admin/realms/{REALM}/users/{user_id}/groups/{group_id}"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.put(url, headers=headers)
    response.raise_for_status()

def role_changes_710():
    """Permission/Role changes for version 7.1.0:
    - Add new permissions
    - Remove obsolete roles
    - Update descriptions for existing roles
    """
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
            "description": "Manage filters you create"
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
    return roles_to_add, roles_to_remove, roles_to_update