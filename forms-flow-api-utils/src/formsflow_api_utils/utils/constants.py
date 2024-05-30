"""All constants for project."""
import os

from dotenv import find_dotenv, load_dotenv

# this will load all the envars from a .env file located in the project root (api)
load_dotenv(find_dotenv())

FORMSFLOW_API_CORS_ORIGINS = os.getenv("FORMSFLOW_API_CORS_ORIGINS", "*")
ALLOW_ALL_ORIGINS = "*"
CORS_ORIGINS = []
if FORMSFLOW_API_CORS_ORIGINS != "*":
    CORS_ORIGINS = FORMSFLOW_API_CORS_ORIGINS.split(",")
ADMIN_GROUP = "formsflow-admin"
CAMUNDA_ADMIN = "camunda-admin"
DESIGNER_GROUP = "formsflow-designer"
REVIEWER_GROUP = "formsflow-reviewer"
CLIENT_GROUP = "formsflow-client"
FORMSFLOW_ROLES = [DESIGNER_GROUP, REVIEWER_GROUP, CLIENT_GROUP]
ALLOW_ALL_APPLICATIONS = "/formsflow/formsflow-reviewer/access-allow-applications"

NEW_APPLICATION_STATUS = "New"
DRAFT_APPLICATION_STATUS = "Draft"
KEYCLOAK_DASHBOARD_BASE_GROUP = "formsflow-analytics"
ANONYMOUS_USER = "Anonymous-user"

FILTER_MAPS = {
    "application_id": {"field": "id", "operator": "eq"},
    "application_name": {"field": "form_name", "operator": "ilike"},
    "application_status": {"field": "application_status", "operator": "eq"},
    "created_by": {"field": "created_by", "operator": "eq"},
    "modified_from": {"field": "modified", "operator": "ge"},
    "modified_to": {"field": "modified", "operator": "le"},
    "created_from": {"field": "created", "operator": "ge"},
    "created_to": {"field": "created", "operator": "le"},
    "form_name": {"field": "form_name", "operator": "ilike"},
    "id": {"field": "id", "operator": "eq"},
    "form_type": {"field": "form_type", "operator": "eq"},
    "can_bundle": {"field": "can_bundle", "operator": "eq"},
    "is_bundle": {"field": "is_bundle", "operator": "eq"},
    "title":{"field": "title", "operator": "ilike"},
    "category":{"field": "category", "operator": "ilike"},
    "process_name": {"field": "name", "operator": "ilike"},
    "process_status": {"field": "status", "operator": "eq"},
    "process_type": {"field": "process_type", "operator": "eq"},
}

DEFAULT_PROCESS_KEY = "Defaultflow"
DEFAULT_PROCESS_NAME = "Default Flow"
HTTP_TIMEOUT = 30
PERMISSIONS = [{
      "name": "create_designs",
      "description": "Create Form, workflow designs",
      "depends_on": ["view_designs"]
    },
    {
      "name": "view_designs",
      "description": "Access to design",
      "depends_on": []
    },
    {
      "name": "create_submissions",
      "description": "Create submissions",
      "depends_on": []
    },
    {
      "name": "view_submissions",
      "description": "Access to submissions",
      "depends_on": []
    },
    {
      "name": "view_dashboards",
      "description": "Access to dashboards",
      "depends_on": []
    },
    {
      "name": "view_tasks",
      "description": "Access to tasks",
      "depends_on": []
    },
    {
      "name": "manage_tasks",
      "description": "Can claim and work on tasks",
      "depends_on": ["view_tasks"]
    },{
      "name": "manage_all_filters",
      "description": "Manage all filters",
      "depends_on": ["view_filters","create_filters"]
    },
    {
      "name": "create_filters",
      "description": "Access to create filters",
      "depends_on": ["view_filters"]
    },
    {
      "name": "view_filters",
      "description": "Access to view filters",
      "depends_on": []
    },
    {
      "name": "manage_integrations",
      "description": "Access to Integrations",
      "depends_on": []
    },
    {
      "name": "manage_dashboard_authorizations",
      "description": "Manage Dashboard Authorization",
      "depends_on": ["view_dashboards"]
    },
    {
      "name": "manage_users",
      "description": "Manage Users",
      "depends_on": []
    },
    {
      "name": "manage_roles",
      "description": "Manage Roles",
      "depends_on": ["manage_users"]
    }
]