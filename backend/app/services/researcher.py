import anthropic

from app.config import get_settings
from app.services.scraper import scrape_website


async def research_lead(
    lead_name: str,
    lead_title: str | None,
    lead_company: str | None,
    lead_website: str | None,
) -> str:
    """Research a lead using their company website + Claude analysis."""
    settings = get_settings()
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    # Try to scrape the lead's company website
    company_content = ""
    if lead_website:
        try:
            company_content = await scrape_website(lead_website)
        except Exception:
            company_content = "(Could not access website)"

    prompt = f"""Research this person and their company. Provide a brief intelligence report.

PERSON:
- Name: {lead_name}
- Title: {lead_title or 'Unknown'}
- Company: {lead_company or 'Unknown'}

THEIR COMPANY'S WEBSITE CONTENT:
{company_content or '(No website provided)'}

Provide a concise research brief (3-5 bullet points) covering:
1. What their company does
2. Their likely role and responsibilities based on their title
3. Potential challenges or pain points they might face
4. Any signals about their company's stage, growth, or needs
5. What kind of solutions they might be looking for

Be specific and insightful, not generic. If you don't have enough info, say so honestly rather than making things up."""

    response = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


async def analyze_company(website_content: str) -> dict:
    """Analyze a company's website to extract name, description, and value prop."""
    settings = get_settings()
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    response = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[{"role": "user", "content": f"""Analyze this company's website content and extract:

WEBSITE CONTENT:
{website_content}

Return EXACTLY this JSON format (no markdown, just raw JSON):
{{
    "name": "Company Name",
    "description": "What the company does in 2-3 sentences",
    "value_proposition": "Their key value proposition - what problem they solve and for whom"
}}"""}],
    )

    import json
    text = response.content[0].text.strip()
    # Handle if Claude wraps in markdown code block
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return json.loads(text)
