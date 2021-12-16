import os
from dotenv import find_dotenv, load_dotenv

# this will load all the envars from a .env file located in the project root (api)
load_dotenv(find_dotenv())

FORMSFLOW_API_CORS_ORIGINS = os.getenv("FORMSFLOW_API_CORS_ORIGINS")
ALLOW_ALL_ORIGINS = "*"
CORS_ORIGINS = []
if FORMSFLOW_API_CORS_ORIGINS != "*":
    CORS_ORIGINS = FORMSFLOW_API_CORS_ORIGINS.split(",")
DESIGNER_GROUP = "formsflow-designer"
REVIEWER_GROUP = "formsflow-reviewer"
ALLOW_ALL_APPLICATIONS = "/formsflow/formsflow-reviewer/access-allow-applications"

NEW_APPLICATION_STATUS = "New"
<<<<<<< HEAD:forms-flow-api/src/formsflow_api/utils/constants.py
KEYCLOAK_DASHBOARD_BASE_GROUP = "formsflow-analytics"
=======
KEYCLOAK_DASHBOARD_BASE_GROUP = "redash"
>>>>>>> ab18dc4fbc21439d35e6548f39d1287ce6e0c4cb:forms-flow-api/src/api/utils/constants.py
