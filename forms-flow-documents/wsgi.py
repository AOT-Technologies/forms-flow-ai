"""Provides the WSGI entry point for running the application."""

from formsflow_documents.app import create_app


application = create_app()  # pylint: disable=invalid-name

if __name__ == "__main__":
    application.run()
