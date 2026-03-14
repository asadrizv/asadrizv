#!/bin/bash
# ============================================================
# Digital Ocean GPU Droplet Setup Script
# Run this on a fresh GPU droplet (Ubuntu 22.04+ with NVIDIA GPU)
#
# Recommended DO GPU Droplet: gpu-h100x1-80gb ($2.50/hr)
# Budget option: gpu-a100x1-80gb or use any NVIDIA GPU instance
#
# Usage:
#   curl -sSL https://raw.githubusercontent.com/<your-repo>/main/infra/setup-gpu-droplet.sh | bash
# ============================================================

set -euo pipefail

echo "=== Qwen vLLM GPU Droplet Setup ==="
echo ""

# --- 1. System updates ---
echo "[1/6] Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git jq htop nvtop

# --- 2. Install Docker ---
echo "[2/6] Installing Docker..."
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# --- 3. Install NVIDIA Container Toolkit ---
echo "[3/6] Installing NVIDIA Container Toolkit..."
if ! command -v nvidia-ctk &>/dev/null; then
    curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | \
        gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg

    curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
        sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
        tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

    apt-get update -y
    apt-get install -y nvidia-container-toolkit
    nvidia-ctk runtime configure --runtime=docker
    systemctl restart docker
fi

# --- 4. Install Docker Compose ---
echo "[4/6] Installing Docker Compose..."
if ! command -v docker-compose &>/dev/null && ! docker compose version &>/dev/null; then
    apt-get install -y docker-compose-plugin
fi

# --- 5. Verify GPU ---
echo "[5/6] Verifying GPU access..."
nvidia-smi
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi

# --- 6. Setup application ---
echo "[6/6] Setting up application..."

APP_DIR="/opt/qwen-chat"
mkdir -p "$APP_DIR"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Clone your repo:  cd $APP_DIR && git clone <your-repo-url> ."
echo "  2. Create .env:      cp .env.example .env && nano .env"
echo "  3. Start services:   docker compose up -d"
echo "  4. Check logs:       docker compose logs -f"
echo "  5. Monitor GPU:      nvtop"
echo ""
echo "The vLLM server will download the model on first start (~15GB)."
echo "This may take 5-10 minutes depending on bandwidth."
echo ""
nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
