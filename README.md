# Qwen Chat - Self-Hosted LLM with vLLM

A self-hosted ChatGPT-like experience powered by **Qwen 2.5 7B Instruct** and **vLLM**, deployed on a Digital Ocean GPU droplet with full CI/CD.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Nginx     │────▶│  FastAPI      │────▶│   vLLM      │
│   (Proxy)   │     │  Backend      │     │  (Qwen 2.5) │
│   :80/:443  │     │  :8080        │     │  :8000      │
└─────────────┘     └──────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│   React     │
│   Frontend  │
│   :3000     │
└─────────────┘
```

## Quick Start (Local Dev)

```bash
# Clone the repo
git clone <your-repo-url> && cd qwen-chat

# Start backend + frontend for development
cd frontend && npm install && npm run dev  # Terminal 1
cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8080  # Terminal 2
```

## Production Deployment on Digital Ocean

### 1. Create a GPU Droplet

- Go to [Digital Ocean GPU Droplets](https://cloud.digitalocean.com/gpu-droplets)
- Select **GPU H100x1 80GB** ($2.50/hr) or **A100x1** for budget
- Choose **Ubuntu 22.04** as the OS
- Add your SSH key

### 2. Setup the Droplet

```bash
ssh root@<your-droplet-ip>
curl -sSL https://raw.githubusercontent.com/<your-repo>/main/infra/setup-gpu-droplet.sh | bash
```

This installs Docker, NVIDIA Container Toolkit, and verifies GPU access.

### 3. Deploy

```bash
cd /opt/qwen-chat
git clone <your-repo-url> .
cp .env.example .env
nano .env  # Set your HF_TOKEN and API_KEY
docker compose up -d
```

First startup downloads the model (~15GB) and takes 5-10 minutes.

### 4. Verify

```bash
# Check all services
docker compose ps

# Watch model loading
docker compose logs -f vllm

# Test the API
curl http://localhost:8080/api/health

# Monitor GPU
nvtop
```

Visit `http://<your-droplet-ip>` to use the chat UI.

## CI/CD Setup

The GitHub Actions pipeline runs on every push to `main`:

1. **Tests backend** - Python lint + import check
2. **Tests frontend** - npm build verification
3. **Deploys** - SSH into the droplet, pull latest, rebuild, restart

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `SSH_HOST` | `root@<droplet-ip>` |
| `SSH_PRIVATE_KEY` | SSH private key for the droplet |

### Setting Up Secrets

```bash
# In your repo settings -> Secrets and variables -> Actions
# Add SSH_HOST: root@your-droplet-ip
# Add SSH_PRIVATE_KEY: contents of your SSH private key
```

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI app with chat proxy
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # React chat UI
│   │   ├── index.css        # Dark theme styles
│   │   └── main.jsx
│   ├── package.json
│   └── Dockerfile
├── nginx/
│   └── nginx.conf           # Reverse proxy + rate limiting
├── infra/
│   ├── setup-gpu-droplet.sh # One-time droplet setup
│   └── deploy.sh            # Manual deploy script
├── .github/workflows/
│   └── deploy.yml           # CI/CD pipeline
├── docker-compose.yml       # Full stack orchestration
└── .env.example
```

## SSL/HTTPS Setup

After deployment, set up SSL with Let's Encrypt:

```bash
# Install certbot
apt install -y certbot

# Get certificate (stop nginx first)
docker compose stop nginx
certbot certonly --standalone -d chat.yourdomain.com
cp /etc/letsencrypt/live/chat.yourdomain.com/fullchain.pem nginx/certs/
cp /etc/letsencrypt/live/chat.yourdomain.com/privkey.pem nginx/certs/

# Uncomment SSL lines in nginx/nginx.conf, then:
docker compose up -d nginx
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HF_TOKEN` | - | Hugging Face token (for gated models) |
| `API_KEY` | `changeme` | API authentication key |
| `VLLM_BASE_URL` | `http://vllm:8000` | vLLM server URL |
| `MODEL_NAME` | `qwen` | Served model name |

## Estimated Costs (Digital Ocean)

| GPU | VRAM | Cost | Performance |
|-----|------|------|-------------|
| H100 80GB | 80GB | ~$2.50/hr | Best - fast inference |
| A100 80GB | 80GB | ~$2.21/hr | Great for 7B model |

For a 7B parameter model, a single A100 or H100 is more than sufficient.
