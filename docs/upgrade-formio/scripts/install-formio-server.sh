#!/bin/bash
# Install Form.io server

cd ff-local
git clone https://github.com/andrepestana-aot/formio.git
cd formio

# env file
cat <<EOF > .env
FORMIO_DB_USERNAME=admin
FORMIO_DB_PASSWORD=changeme
FORMIO_DB_DATABASE=formio
FORMIO_ROOT_EMAIL=admin@example.com
FORMIO_ROOT_PASSWORD=changeme
FORMIO_DEFAULT_PROJECT_URL=http://localhost:3001
FORMIO_JWT_SECRET=--- change me now ---
MULTI_TENANCY_ENABLED=false
NO_INSTALL=1
MONGO=mongodb://localhost:27018/formio
EOF

# Config file
cat <<EOF > config/default.json
{
  "port": 3001,
  "appPort": 8080,
  "host": "0.0.0.0:3001",
  "protocol": "http",
  "allowedOrigins": ["*"],
  "domain": "http://localhost:3001",
  "basePath": "",
  "mongo": "mongodb://admin:changeme@localhost:27018/formio?authSource=admin",
  "mongoConfig": "",
  "mongoCA": "",
  "mongoSecret": "changeme",
  "reservedForms": [
    "submission",
    "exists",
    "export",
    "role",
    "current",
    "logout",
    "import",
    "form",
    "access",
    "token",
    "recaptcha"
  ],
  "jwt": {
    "secret": "--- change me now ---",
    "expireTime": 240
  },
  "email": {
    "type": "sendgrid",
    "username": "sendgrid-user",
    "password": "sendgrid-pass"
  },
  "settings": {
    "office365": {
      "tenant": "",
      "clientId": "",
      "email": "",
      "cert": "",
      "thumbprint": ""
    },
    "email": {
      "gmail": {
        "auth": {
          "user": "",
          "pass": ""
        }
      },
      "sendgrid": {
        "auth": {
          "api_user": "",
          "api_key": ""
        }
      },
      "mandrill": {
        "auth": {
          "apiKey": ""
        }
      }
    }
  }
}
EOF

# Patch to disable authentication for currentUser
sed -i '/const currentUser = (req, res, next) => {/,/^  };/c\
  const currentUser = () => Promise.resolve({ _id: null, data: {}, roles: [] });' src/authentication/index.js
  

npm install

cd ../..