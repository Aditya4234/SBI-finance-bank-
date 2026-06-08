#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push --schema=prisma/schema.prisma --accept-data-loss
npx prisma db push --schema=prisma/schema-corporate.prisma --accept-data-loss
echo "Migrations complete."

echo "Starting server..."
exec node dist/server.js
