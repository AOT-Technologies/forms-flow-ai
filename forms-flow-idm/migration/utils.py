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


def update_client_roles(token, client_id, roles):
    """Update a client's roles."""
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
