import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session
from app.models.campaign import Campaign, CampaignStatus
from app.models.company import Company
from app.models.email_draft import EmailDraft
from app.models.lead import Lead, ResearchStatus
from app.services.email_generator import generate_email
from app.services.researcher import research_lead


async def process_campaign(campaign_id: uuid.UUID):
    """Background task: research all leads and generate emails for a campaign."""
    async with async_session() as db:
        campaign = await db.get(Campaign, campaign_id)
        if not campaign:
            return

        company = await db.get(Company, campaign.company_id)
        if not company:
            return

        # Update campaign status
        campaign.status = CampaignStatus.researching
        await db.commit()

        # Get all pending leads
        result = await db.execute(
            select(Lead).where(
                Lead.campaign_id == campaign_id,
                Lead.research_status == ResearchStatus.pending,
            )
        )
        leads = result.scalars().all()

        # Research each lead
        for lead in leads:
            lead.research_status = ResearchStatus.in_progress
            await db.commit()

            try:
                summary = await research_lead(
                    lead_name=lead.name,
                    lead_title=lead.title,
                    lead_company=lead.company_name,
                    lead_website=lead.company_website,
                )
                lead.research_summary = summary
                lead.research_status = ResearchStatus.done
            except Exception as e:
                lead.research_summary = f"Research failed: {str(e)}"
                lead.research_status = ResearchStatus.failed

            await db.commit()

        # Generate emails
        campaign.status = CampaignStatus.generating
        await db.commit()

        result = await db.execute(
            select(Lead).where(
                Lead.campaign_id == campaign_id,
                Lead.research_status == ResearchStatus.done,
            )
        )
        researched_leads = result.scalars().all()

        for lead in researched_leads:
            # Skip if email already exists
            existing = await db.execute(
                select(EmailDraft).where(EmailDraft.lead_id == lead.id)
            )
            if existing.scalar_one_or_none():
                continue

            try:
                email_data = await generate_email(
                    sender_company=company.name,
                    sender_value_prop=company.value_proposition or company.description or "",
                    lead_name=lead.name,
                    lead_title=lead.title,
                    lead_company=lead.company_name,
                    lead_email=lead.email,
                    research_summary=lead.research_summary or "",
                    category=campaign.category.value,
                )
                draft = EmailDraft(
                    lead_id=lead.id,
                    subject=email_data["subject"],
                    body=email_data["body"],
                )
                db.add(draft)
                await db.commit()
            except Exception:
                continue

        campaign.status = CampaignStatus.ready
        await db.commit()
