import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CampaignCategory(str, enum.Enum):
    sales = "sales"
    recruitment = "recruitment"


class CampaignStatus(str, enum.Enum):
    draft = "draft"
    researching = "researching"
    generating = "generating"
    ready = "ready"


class Campaign(Base):
    __tablename__ = "campaigns"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[CampaignCategory] = mapped_column(Enum(CampaignCategory), nullable=False)
    status: Mapped[CampaignStatus] = mapped_column(Enum(CampaignStatus), default=CampaignStatus.draft)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    company: Mapped["Company"] = relationship(back_populates="campaigns")
    leads: Mapped[list["Lead"]] = relationship(back_populates="campaign", cascade="all, delete-orphan")
