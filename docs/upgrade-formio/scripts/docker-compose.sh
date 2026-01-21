#!/bin/bash
# Install FormsFlow.ai server using Docker Compose 

docker compose -p formio-upgrade -f docker-compose.merged.yml --project-directory ff-local/forms-flow-ai up -d --build


# docker compose -p formio-upgrade -f docker-compose.merged.yml --project-directory ff-local/forms-flow-ai up -d forms-flow-bpm
# docker compose -p formio-upgrade -f docker-compose.merged.yml --project-directory ff-local/forms-flow-ai up -d forms-flow-web
# docker compose -p formio-upgrade -f docker-compose.merged.yml --project-directory ff-local/forms-flow-ai up -d forms-flow-web-root-config
# docker compose -p formio-upgrade -f docker-compose.merged.yml --project-directory ff-local/forms-flow-ai up -d forms-flow-idm
# docker compose -p formio-upgrade -f docker-compose.merged.yml --project-directory ff-local/forms-flow-ai up -d forms-flow-analytics
# docker compose -p formio-upgrade -f docker-compose.merged.yml --project-directory ff-local/forms-flow-ai up -d forms-flow-forms
# docker compose -p formio-upgrade -f docker-compose.merged.yml --project-directory ff-local/forms-flow-ai up -d forms-flow-api
# docker compose -p formio-upgrade -f docker-compose.merged.yml --project-directory ff-local/forms-flow-ai up -d forms-flow-documents
# docker compose -p formio-upgrade -f docker-compose.merged.yml --project-directory ff-local/forms-flow-ai up -d forms-flow-redis
