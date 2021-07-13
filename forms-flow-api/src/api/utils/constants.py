import os

FORMSFLOW_API_CORS_ORIGINS = os.getenv("FORMSFLOW_API_CORS_ORIGINS")
ALLOW_ALL_ORIGINS = "*"
CORS_ORIGINS = []
if FORMSFLOW_API_CORS_ORIGINS != "*":
    CORS_ORIGINS = FORMSFLOW_API_CORS_ORIGINS.split(",")
REVIEWER_GROUP = "formsflow-reviewer"
ALLOW_ALL_APPLICATIONS = "/formsflow/formsflow-reviewer/access-allow-applications"
