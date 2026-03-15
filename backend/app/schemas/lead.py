import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.lead import ResearchStatus


class LeadResponse(BaseModel):
    id: uuid.UUID
    campaign_id: uuid.UUID
    name: str
    email: str
    title: str | None
    company_name: str | None
    company_website: str | None
    linkedin_url: str | None
    research_summary: str | None
    research_status: ResearchStatus
    created_at: datetime

    class Config:
        from_attributes = True
