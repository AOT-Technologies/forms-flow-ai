echo 'starting application.'
echo 'starting database migration.'
export FLASK_APP=manage.py
flask db upgrade
echo 'database migration completed.'
gunicorn -b :5000 'formsflow_api:create_app()' --timeout 120 --worker-class=gthread --workers=5 --threads=10
