#!/usr/bin/env bash
set -euo pipefail

echo "Starting ReqLab in development mode..."
docker compose up --build
