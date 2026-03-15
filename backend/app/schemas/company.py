import uuid
from datetime import datetime

from pydantic import BaseModel, HttpUrl


class CompanyCreate(BaseModel):
    website_url: str


class CompanyResponse(BaseModel):
    id: uuid.UUID
    name: str
    website_url: str
    description: str | None
    value_proposition: str | None
    created_at: datetime

    class Config:
        from_attributes = True
