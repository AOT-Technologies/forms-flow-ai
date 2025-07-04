#!/bin/bash
set -e

echo "Container starting as UID: $(id -u), GID: $(id -g)"


# Example target directory
TARGET_DIR="/forms-flow-data-analysis-api/app/logs /app/model_cache /tmp/huggingface"
for dir in $TARGET_DIR; do
    if [ -d "$dir" ]; then
        echo "Setting ownership and permissions on $dir"
        
        # Change ownership to the current UID and GID
        chown -R "$(id -u):$(id -g)" "$dir"

        # Ensure group read/write/execute permissions
        chmod -R g+rwX "$dir"

        echo "Permissions set:"
        ls -ld "$dir"
    else
        echo "Directory $dir does not exist. Creating it now."
        mkdir -p "$dir"
    fi
done

# flask db init&&flask db migrate 
if [ "$DATABASE_SUPPORT" = "ENABLED" ]
then
    flask db upgrade
fi
# running the flask server using gunicorn
gunicorn -b :5000 'gunicorn_config:app' --timeout 120 --worker-class=gthread --workers=5 --threads=10 --preload