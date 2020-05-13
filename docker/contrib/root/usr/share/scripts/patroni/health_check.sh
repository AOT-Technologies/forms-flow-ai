#!/usr/bin/env bash
set -Eeu
set -o pipefail

pg_isready -q && patronictl list --format=json | jq -e ".[] | select(.Member == \"$(hostname)\" and .State == \"running\" and .\"Lag in MB\" == 0)"
