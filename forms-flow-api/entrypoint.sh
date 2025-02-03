echo 'starting application.'
echo 'starting database migration.'
export FLASK_APP=manage.py
flask db upgrade
echo 'database migration completed.'
gunicorn -b :5000 'formsflow_api:create_app()' --timeout $GUNICORN_TIMEOUT --worker-class=gthread --workers=$GUNICORN_WORKERS --threads=$GUNICORN_THREADS