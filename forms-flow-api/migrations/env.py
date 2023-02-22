from alembic import context
from flask import current_app
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import pool

# Get the existing instance of SQLAlchemy for the Flask app
db = SQLAlchemy()

# Set up SQLAlchemy database connection
config = context.config
sqlalchemy_url = current_app.config['SQLALCHEMY_DATABASE_URI']
config.set_main_option('sqlalchemy.url', sqlalchemy_url)

# Create target metadata for the database
target_metadata = db.metadata


# Function for running migrations in the context of the Flask application
def run_migrations_online():
    # Set up the context for Alembic migrations
    connectable = context.engine_from_config(
        config.get_section(config.config_ini_section),
        prefix='sqlalchemy.',
        poolclass=pool.NullPool
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


# Run migrations if this file is being executed directly
if context.is_offline_mode():
    run_migrations_online()