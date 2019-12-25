#!/bin/sh

set -e

until pg_isready -h $DATABASE_HOST 2>/dev/null; do echo '=> Waiting for PostgreSQL to start...'; sleep 2; done

echo "=> Executing database migrations"
yarn migrations:latest

echo "=> Populating database"
./bin/commands/populate-command.js

exec "$@"
