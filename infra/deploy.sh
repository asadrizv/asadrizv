#!/bin/bash
# ============================================================
# Deployment script - run from CI/CD or manually
# Usage: SSH_HOST=your-gpu-droplet ./infra/deploy.sh
# ============================================================

set -euo pipefail

SSH_HOST="${SSH_HOST:?Set SSH_HOST env var (e.g. root@your-droplet-ip)}"
APP_DIR="${APP_DIR:-/opt/qwen-chat}"
BRANCH="${BRANCH:-main}"
REPO_URL="${REPO_URL:?Set REPO_URL env var}"

echo "=== Deploying to $SSH_HOST ==="

ssh -o StrictHostKeyChecking=no "$SSH_HOST" bash -s <<REMOTE
set -euo pipefail

cd "$APP_DIR"

# Clone or pull
if [ ! -d .git ]; then
    git clone -b "$BRANCH" "$REPO_URL" .
else
    git fetch origin "$BRANCH"
    git reset --hard "origin/$BRANCH"
fi

# Build and restart
docker compose build --parallel
docker compose up -d

# Clean up old images
docker image prune -f

echo "=== Deployment complete ==="
docker compose ps
REMOTE
