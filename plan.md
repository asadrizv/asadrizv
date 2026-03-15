# Rippleberry MVP — Implementation Plan

## Product Summary
User provides their company website + uploads a CSV of leads → Rippleberry researches each lead → generates hyper-personalized email drafts → user can send individually (opens Gmail/Outlook) or send all.

---

## Backend (FastAPI, Clean Architecture)

### Project Structure
```
backend/
├── app/
│   ├── main.py                  # FastAPI app, CORS, lifespan
│   ├── config.py                # Settings (env vars, DB URL, API keys)
│   ├── database.py              # SQLAlchemy engine + session
│   │
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── company.py           # Company (user's company)
│   │   ├── campaign.py          # Campaign (a batch of outreach)
│   │   ├── lead.py              # Lead profiles
│   │   └── email_draft.py       # Generated email drafts
│   │
│   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── company.py
│   │   ├── campaign.py
│   │   ├── lead.py
│   │   └── email_draft.py
│   │
│   ├── routers/                 # API route handlers
│   │   ├── companies.py
│   │   ├── campaigns.py
│   │   ├── leads.py
│   │   └── emails.py
│   │
│   ├── services/                # Business logic
│   │   ├── scraper.py           # Website scraping + summarization
│   │   ├── researcher.py        # Lead research (public signals)
│   │   ├── email_generator.py   # Claude-powered email drafting
│   │   └── csv_parser.py        # CSV upload parsing
│   │
│   └── workers/                 # Background task processing
│       └── tasks.py             # Research + generate pipeline
```

### DB Schema (PostgreSQL)

**companies**
- id (UUID, PK)
- name (str)
- website_url (str)
- description (text) — scraped/summarized product description
- value_proposition (text) — what they sell, extracted by Claude
- created_at (timestamp)

**campaigns**
- id (UUID, PK)
- company_id (FK → companies)
- name (str) — e.g. "March 2026 Outreach"
- category (enum: sales | recruitment)
- status (enum: draft | researching | generating | ready)
- created_at (timestamp)

**leads**
- id (UUID, PK)
- campaign_id (FK → campaigns)
- name (str)
- email (str)
- title (str, nullable)
- company_name (str, nullable)
- company_website (str, nullable)
- linkedin_url (str, nullable)
- research_summary (text, nullable) — AI-generated research notes
- research_status (enum: pending | in_progress | done | failed)
- created_at (timestamp)

**email_drafts**
- id (UUID, PK)
- lead_id (FK → leads)
- subject (str)
- body (text)
- status (enum: draft | sent)
- created_at (timestamp)

### API Endpoints

**Companies**
- `POST /api/companies` — Create company from website URL (triggers scraping)
- `GET /api/companies` — List user's companies
- `GET /api/companies/{id}` — Get company details + value prop

**Campaigns**
- `POST /api/campaigns` — Create campaign (company_id, name, category)
- `GET /api/campaigns` — List campaigns
- `GET /api/campaigns/{id}` — Get campaign with lead stats

**Leads**
- `POST /api/campaigns/{id}/leads/upload` — Upload CSV of leads
- `GET /api/campaigns/{id}/leads` — List leads with research status

**Emails**
- `POST /api/campaigns/{id}/generate` — Kick off research + email generation for all leads
- `GET /api/campaigns/{id}/emails` — Get all generated email drafts
- `GET /api/emails/{id}/mailto` — Returns mailto: link (for Gmail/Outlook open)
- `PATCH /api/emails/{id}` — Edit a draft / mark as sent
- `POST /api/campaigns/{id}/send-all` — Returns all mailto links or generates a bulk mailto page

### Background Pipeline (using FastAPI BackgroundTasks for MVP)

For each lead in a campaign:
1. **Scrape lead's company website** (if provided) — extract what they do
2. **Research signals** — job postings, news, tech stack (best effort via web scraping)
3. **Store research_summary** on the lead
4. **Generate email** — Claude takes (your company value prop + lead research) → personalized email
5. **Store email_draft**

For MVP, use FastAPI BackgroundTasks (no Redis/Celery needed yet). Can upgrade later.

### Claude Prompt Chain

**Step 1: Understand the user's company** (when they submit website URL)
```
Prompt: "Here is the content from {website_url}. Extract:
1. Company name
2. What they sell (product/service)
3. Key value propositions
4. Target customer profile
5. Key differentiators
Return as structured JSON."
```

**Step 2: Research a lead** (for each lead)
```
Prompt: "Given this lead: {name, title, company_name}.
Here is their company's website content: {scraped_content}.
Identify:
1. What their company does
2. Likely challenges based on their role and company stage
3. Any signals that suggest they might need {user's product category}
Return as a research brief."
```

**Step 3: Generate personalized email**
```
Prompt: "You are writing a cold outreach email.

SENDER's company: {company description + value prop}
RECIPIENT: {lead name, title, company}
RESEARCH on recipient: {research_summary}
CATEGORY: {sales or recruitment}

Write a short, personalized cold email (3-5 sentences max).
- Reference something specific about their company/role
- Connect it to how the sender's product solves a relevant pain point
- End with a soft CTA (not pushy)
- Keep it human, not salesy

Return JSON: { subject: string, body: string }"
```

---

## Frontend (React + Vite)

### Pages / Flow

1. **Home / Dashboard** (`/`)
   - List of campaigns with status badges
   - "New Campaign" button

2. **New Campaign** (`/campaigns/new`)
   - Step 1: Enter your company website URL → scrapes and shows extracted value prop (editable)
   - Step 2: Name the campaign, pick category (Sales / Recruitment)
   - Step 3: Upload CSV of leads (preview table shown)
   - Submit → creates campaign + company + leads

3. **Campaign Detail** (`/campaigns/:id`)
   - Shows campaign info + status
   - Table of leads with columns: Name, Email, Company, Title, Research Status, Email Status
   - "Generate Emails" button → kicks off the pipeline
   - Progress indicator as research/generation runs
   - Once done, each row shows "View Email" button

4. **Email Review** (`/campaigns/:id/emails`)
   - List/card view of all generated emails
   - Each card shows: lead name, subject, email preview
   - "Send" button per email → opens `mailto:` link (works with default email client / Gmail / Outlook)
   - "Send All" button → opens all mailto links or copies all to clipboard
   - Edit capability on each draft before sending

### Send Mechanism
- **Individual send:** `mailto:{email}?subject={encoded_subject}&body={encoded_body}` — opens default email client
- **Send All:** Opens each mailto link in sequence (with small delay) OR provides a "copy all" option
- Frontend constructs the mailto links from the draft data

### Component Structure
```
src/
├── App.jsx              # Router setup
├── pages/
│   ├── Dashboard.jsx
│   ├── NewCampaign.jsx
│   └── CampaignDetail.jsx
├── components/
│   ├── LeadTable.jsx
│   ├── EmailCard.jsx
│   ├── CsvUploader.jsx
│   ├── CompanyForm.jsx
│   └── StatusBadge.jsx
├── api/
│   └── client.js        # Fetch wrapper for API calls
└── index.css
```

---

## Infrastructure

- Replace vLLM service in docker-compose with PostgreSQL
- Keep FastAPI backend, React frontend, Nginx
- Add `ANTHROPIC_API_KEY` to backend env
- For MVP: no Redis, no Celery — just BackgroundTasks

### Updated docker-compose services:
1. **postgres** — PostgreSQL 16
2. **backend** — FastAPI (depends on postgres)
3. **frontend** — React + Vite
4. **nginx** — Reverse proxy

---

## Implementation Order

1. Set up DB + models + docker-compose with PostgreSQL
2. Company creation endpoint + website scraping + Claude analysis
3. Campaign + lead CSV upload endpoints
4. Research + email generation pipeline (background tasks)
5. Email endpoints (list drafts, mailto generation)
6. Frontend: New Campaign flow (company URL → CSV upload)
7. Frontend: Campaign detail + email review
8. Frontend: Send buttons (mailto) + Send All
9. Polish + test end-to-end
