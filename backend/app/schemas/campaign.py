import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.campaign import CampaignCategory, CampaignStatus


class CampaignCreate(BaseModel):
    company_id: uuid.UUID
    name: str
    category: CampaignCategory


class CampaignResponse(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    name: str
    category: CampaignCategory
    status: CampaignStatus
    created_at: datetime
    lead_count: int = 0
    emails_ready: int = 0

    class Config:
        from_attributes = True
