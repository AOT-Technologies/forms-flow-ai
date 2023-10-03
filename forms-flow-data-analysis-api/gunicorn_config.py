"""The configuration for gunicorn, which picks up the runtime options from environment variables."""

import os
from api import create_app


workers = int(os.environ.get('GUNICORN_PROCESSES', '5'))
threads = int(os.environ.get('GUNICORN_THREADS', '10'))

forwarded_allow_ips = '*'
secure_scheme_headers = {'X-Forwarded-Proto': 'https'}

# Initialize the Flask app
app = create_app()
