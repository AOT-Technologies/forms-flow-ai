"""Trigger migration scripts."""

import sys

from camunda_authorization_migration import migrate_authorization
from camunda_filter_migration import migrate_filters

from formsflow_api import create_app


def run(argument, tenant_key=None):
    """Invoke migration scripts."""
    application = create_app()
    application.app_context().push()
    if argument == "form":
        migrate_authorization("FORM")
    elif argument == "application":
        migrate_authorization("APPLICATION")
    elif argument == "filter":
        migrate_filters(tenant_key)
    else:
        sys.exit("Unsupported argument.")


if __name__ == "__main__":
    argument = "form" if len(sys.argv) < 2 else sys.argv[1]
    tenant_key = sys.argv[2] if len(sys.argv) >= 3 else None
    run(argument.lower(), tenant_key)
