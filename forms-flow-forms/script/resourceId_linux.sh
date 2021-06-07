#!/bin/bash

email=$!
password=$2

response="$(curl -s -o /dev/null -D - 'http://localhost:3001/user/login' --header 'Content-Type: application/json' --data-raw '{"data": {"email": "admin@example.com","password": "CHANGEME"}}')"


