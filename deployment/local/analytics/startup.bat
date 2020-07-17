@echo off
TITLE FormsFlow-AI Startup
echo Starting up Redash
echo Initializing.....
docker-compose run --rm server create_db 
echo Starting.....
docker-compose up -d
echo Complete. Application is available at http://localhost:7000