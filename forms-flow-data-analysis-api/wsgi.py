"""Provides the WSGI entry point for running the application."""

from api import create_app

app = create_app()  # pylint: disable=invalid-name

if __name__ == '__main__':
    app.run()
