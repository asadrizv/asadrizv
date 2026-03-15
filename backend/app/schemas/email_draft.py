import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.email_draft import EmailStatus


class EmailDraftResponse(BaseModel):
    id: uuid.UUID
    lead_id: uuid.UUID
    subject: str
    body: str
    status: EmailStatus
    created_at: datetime
    lead_name: str = ""
    lead_email: str = ""
    lead_company: str = ""

    class Config:
        from_attributes = True


class EmailDraftUpdate(BaseModel):
    subject: str | None = None
    body: str | None = None
    status: EmailStatus | None = None
