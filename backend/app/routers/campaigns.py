import asyncio
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, File
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.campaign import Campaign, CampaignStatus
from app.models.company import Company
from app.models.email_draft import EmailDraft
from app.models.lead import Lead
from app.schemas.campaign import CampaignCreate, CampaignResponse
from app.schemas.lead import LeadResponse
from app.services.csv_parser import parse_csv
from app.workers.tasks import process_campaign

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])


@router.post("", response_model=CampaignResponse)
async def create_campaign(body: CampaignCreate, db: AsyncSession = Depends(get_db)):
    company = await db.get(Company, body.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    campaign = Campaign(
        company_id=body.company_id,
        name=body.name,
        category=body.category,
    )
    db.add(campaign)
    await db.commit()
    await db.refresh(campaign)
    return CampaignResponse(
        id=campaign.id,
        company_id=campaign.company_id,
        name=campaign.name,
        category=campaign.category,
        status=campaign.status,
        created_at=campaign.created_at,
    )


@router.get("", response_model=list[CampaignResponse])
async def list_campaigns(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campaign).order_by(Campaign.created_at.desc()))
    campaigns = result.scalars().all()

    responses = []
    for c in campaigns:
        lead_count = await db.scalar(
            select(func.count()).where(Lead.campaign_id == c.id)
        )
        email_count = await db.scalar(
            select(func.count())
            .select_from(EmailDraft)
            .join(Lead)
            .where(Lead.campaign_id == c.id)
        )
        responses.append(CampaignResponse(
            id=c.id,
            company_id=c.company_id,
            name=c.name,
            category=c.category,
            status=c.status,
            created_at=c.created_at,
            lead_count=lead_count or 0,
            emails_ready=email_count or 0,
        ))
    return responses


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    campaign = await db.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    lead_count = await db.scalar(
        select(func.count()).where(Lead.campaign_id == campaign.id)
    )
    email_count = await db.scalar(
        select(func.count())
        .select_from(EmailDraft)
        .join(Lead)
        .where(Lead.campaign_id == campaign.id)
    )
    return CampaignResponse(
        id=campaign.id,
        company_id=campaign.company_id,
        name=campaign.name,
        category=campaign.category,
        status=campaign.status,
        created_at=campaign.created_at,
        lead_count=lead_count or 0,
        emails_ready=email_count or 0,
    )


@router.post("/{campaign_id}/leads/upload", response_model=list[LeadResponse])
async def upload_leads(
    campaign_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    campaign = await db.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    content = (await file.read()).decode("utf-8")
    try:
        parsed = parse_csv(content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not parsed:
        raise HTTPException(status_code=400, detail="No valid leads found in CSV")

    leads = []
    for p in parsed:
        lead = Lead(
            campaign_id=campaign_id,
            name=p.name,
            email=p.email,
            title=p.title,
            company_name=p.company_name,
            company_website=p.company_website,
            linkedin_url=p.linkedin_url,
        )
        db.add(lead)
        leads.append(lead)

    await db.commit()
    for lead in leads:
        await db.refresh(lead)

    return leads


@router.get("/{campaign_id}/leads", response_model=list[LeadResponse])
async def list_leads(campaign_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Lead).where(Lead.campaign_id == campaign_id).order_by(Lead.created_at)
    )
    return result.scalars().all()


@router.post("/{campaign_id}/generate")
async def generate_emails(
    campaign_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    campaign = await db.get(Campaign, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.status in (CampaignStatus.researching, CampaignStatus.generating):
        raise HTTPException(status_code=409, detail="Campaign is already being processed")

    background_tasks.add_task(process_campaign, campaign_id)
    return {"status": "processing", "message": "Research and email generation started"}
