"""This module holds general utility functions and helpers for the main package."""

from .auth import auth, jwt
from .constants import (
    ALLOW_ALL_APPLICATIONS,
    ALLOW_ALL_ORIGINS,
    ANONYMOUS_USER,
    ADMIN_GROUP,
    CAMUNDA_ADMIN,
    CLIENT_GROUP,
    CORS_ORIGINS,
    DEFAULT_PROCESS_KEY,
    DEFAULT_PROCESS_NAME,
    DESIGNER_GROUP,
    DRAFT_APPLICATION_STATUS,
    FILTER_MAPS,
    FORMSFLOW_API_CORS_ORIGINS,
    FORMSFLOW_ROLES,
    KEYCLOAK_DASHBOARD_BASE_GROUP,
    NEW_APPLICATION_STATUS,
    REVIEWER_GROUP,
    HTTP_TIMEOUT
)
from .enums import ApplicationSortingParameters
from .file_log_handler import CustomTimedRotatingFileHandler, register_log_handlers
from .format import CustomFormatter
from .logging import setup_logging, log_bpm_error
from .profiler import profiletime
from .user_context import UserContext, user_context
from .util import (
    cors_preflight,
    get_form_and_submission_id_from_form_url,
    get_role_ids_from_user_groups,
    translate,
    validate_sort_order_and_order_by,
)
from .caching import Cache
from .sentry import init_sentry
from .formio import generate_formio_patch_request
