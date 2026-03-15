import uuid
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.email_draft import EmailDraft, EmailStatus
from app.models.lead import Lead
from app.schemas.email_draft import EmailDraftResponse, EmailDraftUpdate

router = APIRouter(prefix="/api", tags=["emails"])


@router.get("/campaigns/{campaign_id}/emails", response_model=list[EmailDraftResponse])
async def list_emails(campaign_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(EmailDraft)
        .join(Lead)
        .where(Lead.campaign_id == campaign_id)
        .options(selectinload(EmailDraft.lead))
        .order_by(Lead.created_at)
    )
    drafts = result.scalars().all()

    return [
        EmailDraftResponse(
            id=d.id,
            lead_id=d.lead_id,
            subject=d.subject,
            body=d.body,
            status=d.status,
            created_at=d.created_at,
            lead_name=d.lead.name,
            lead_email=d.lead.email,
            lead_company=d.lead.company_name or "",
        )
        for d in drafts
    ]


@router.patch("/emails/{email_id}", response_model=EmailDraftResponse)
async def update_email(
    email_id: uuid.UUID,
    body: EmailDraftUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EmailDraft)
        .where(EmailDraft.id == email_id)
        .options(selectinload(EmailDraft.lead))
    )
    draft = result.scalar_one_or_none()
    if not draft:
        raise HTTPException(status_code=404, detail="Email draft not found")

    if body.subject is not None:
        draft.subject = body.subject
    if body.body is not None:
        draft.body = body.body
    if body.status is not None:
        draft.status = body.status

    await db.commit()
    await db.refresh(draft)

    return EmailDraftResponse(
        id=draft.id,
        lead_id=draft.lead_id,
        subject=draft.subject,
        body=draft.body,
        status=draft.status,
        created_at=draft.created_at,
        lead_name=draft.lead.name,
        lead_email=draft.lead.email,
        lead_company=draft.lead.company_name or "",
    )


@router.get("/emails/{email_id}/mailto")
async def get_mailto(email_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(EmailDraft)
        .where(EmailDraft.id == email_id)
        .options(selectinload(EmailDraft.lead))
    )
    draft = result.scalar_one_or_none()
    if not draft:
        raise HTTPException(status_code=404, detail="Email draft not found")

    mailto = (
        f"mailto:{draft.lead.email}"
        f"?subject={quote(draft.subject)}"
        f"&body={quote(draft.body)}"
    )
    return {"mailto": mailto}


@router.post("/campaigns/{campaign_id}/send-all")
async def send_all_mailto(campaign_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Return mailto links for all draft emails in a campaign."""
    result = await db.execute(
        select(EmailDraft)
        .join(Lead)
        .where(Lead.campaign_id == campaign_id, EmailDraft.status == EmailStatus.draft)
        .options(selectinload(EmailDraft.lead))
        .order_by(Lead.created_at)
    )
    drafts = result.scalars().all()

    links = []
    for d in drafts:
        mailto = (
            f"mailto:{d.lead.email}"
            f"?subject={quote(d.subject)}"
            f"&body={quote(d.body)}"
        )
        links.append({
            "email_id": str(d.id),
            "lead_name": d.lead.name,
            "mailto": mailto,
        })

    return {"links": links, "count": len(links)}
