#!/bin/bash
set -e

# Start Uvicorn in the background
echo "Starting Uvicorn..."
cd /app/backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 &

# Wait a moment for Uvicorn to start
sleep 2

# Start Nginx in the foreground
echo "Starting Nginx..."
nginx -g "daemon off;"
