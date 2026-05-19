# Sahil — Pakistan's all-in-one booking platform

A Shore.com-inspired booking platform for Pakistani service businesses (salons, barbers, spas, clinics, fitness, tutors, auto care).

- **Backend:** FastAPI + SQLModel (SQLite)
- **Frontend:** Vanilla JS SPA (no build step) served by FastAPI
- **Deploy:** GitHub Actions → Railway

## Run locally

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload
# open http://localhost:8000
```

The database auto-creates and seeds itself at first boot.

## Deploy

Pushes to `main` or `claude/shore-pakistan-replica-9W8fw` trigger `.github/workflows/deploy.yml`, which uploads the build to Railway.

### Required GitHub secret

- **`RAILWAY_TOKEN`** — a Railway **project token** (Settings → Tokens on the Railway project)

### Optional GitHub secret

- **`RAILWAY_SERVICE`** — service name, only needed if your Railway project contains multiple services

### One-time Railway setup (from your phone)

1. Open **railway.com** → sign in → **New Project → Empty Project**
2. Inside the project → **Settings → Tokens → New Token** → copy it
3. Add it on GitHub: **repo → Settings → Secrets and variables → Actions → New repository secret** → name `RAILWAY_TOKEN`
4. Push (or re-run the workflow) — the action will create a service and deploy
5. In Railway, open the service → **Settings → Networking → Generate Domain** to get a public URL

### Persistence (recommended)

The app writes SQLite to the `DATA_DIR` env var (default `/tmp`). To keep data across deploys, in Railway:

- Service → **Variables** → add `DATA_DIR=/data`
- Service → **Volumes** → mount a volume at `/data`
