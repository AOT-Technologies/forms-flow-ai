#!/bin/bash
# running the flask server using gunicorn
gunicorn -b :5000 'gunicorn_config:app' --timeout 120 --worker-class=gthread --workers=5 --threads=10 --preload