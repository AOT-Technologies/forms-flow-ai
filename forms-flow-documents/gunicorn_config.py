"""The configuration for gunicorn, which picks up the runtime options from environment variables."""

import os


workers = int(os.environ.get("GUNICORN_PROCESSES", "1"))
threads = int(os.environ.get("GUNICORN_THREADS", "1"))

forwarded_allow_ips = "*"
secure_scheme_headers = {"X-Forwarded-Proto": "https"}
