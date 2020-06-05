Steps required to run for initital setup
   (a) Create venv & install
        pip3 install -r requirements.txt

    (b)set DATABASE_URL in .env file
    migrate DB using following commands
        python manage.py db upgrade

No need to do the following steps for inital setup
python  manage.py db init
python manage.py db migrate --message 'initial database migration'
python manage.py db upgrade


to generate versions use
    create a model 
    python manage.py db revision -m 'short_name_of_your_revision'
    python manage.py db upgrade

to run
    python manage.py run