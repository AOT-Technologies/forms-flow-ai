import os

FORMSFLOW_API_CORS_ORIGINS = os.getenv("FORMSFLOW_API_CORS_ORIGINS")
<<<<<<< HEAD
if FORMSFLOW_API_CORS_ORIGINS == "*":
    CORS_ORIGINS = "*"
else:
=======
if FORMSFLOW_API_CORS_ORIGINS=="*": CORS_ORIGINS = "*"
else: 
>>>>>>> d6193976573a24f5bb6f02b70b1dbe2e246f0a3d
    CORS_ORIGINS = FORMSFLOW_API_CORS_ORIGINS.split(",")
REVIEWER_GROUP = "formsflow-reviewer"
ALLOW_ALL_APPLICATIONS = "/formsflow/formsflow-reviewer/access-allow-applications"
