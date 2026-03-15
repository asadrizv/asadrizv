import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyResponse
from app.services.researcher import analyze_company
from app.services.scraper import scrape_website

router = APIRouter(prefix="/api/companies", tags=["companies"])


@router.post("", response_model=CompanyResponse)
async def create_company(body: CompanyCreate, db: AsyncSession = Depends(get_db)):
    """Create a company by scraping its website and analyzing with Claude."""
    try:
        content = await scrape_website(body.website_url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not scrape website: {str(e)}")

    try:
        analysis = await analyze_company(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    company = Company(
        name=analysis.get("name", body.website_url),
        website_url=body.website_url,
        description=analysis.get("description"),
        value_proposition=analysis.get("value_proposition"),
    )
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company


@router.get("", response_model=list[CompanyResponse])
async def list_companies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Company).order_by(Company.created_at.desc()))
    return result.scalars().all()


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(company_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company
