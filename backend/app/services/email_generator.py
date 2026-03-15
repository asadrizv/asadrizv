import json

import anthropic

from app.config import get_settings


async def generate_email(
    sender_company: str,
    sender_value_prop: str,
    lead_name: str,
    lead_title: str | None,
    lead_company: str | None,
    lead_email: str,
    research_summary: str,
    category: str,
) -> dict:
    """Generate a personalized cold email using Claude."""
    settings = get_settings()
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    category_context = {
        "sales": "You are writing a sales outreach email to introduce a product/service.",
        "recruitment": "You are writing a recruitment outreach email to attract talent.",
    }

    prompt = f"""{category_context.get(category, category_context['sales'])}

SENDER'S COMPANY: {sender_company}
SENDER'S VALUE PROPOSITION: {sender_value_prop}

RECIPIENT:
- Name: {lead_name}
- Title: {lead_title or 'Unknown'}
- Company: {lead_company or 'Unknown'}
- Email: {lead_email}

RESEARCH ON RECIPIENT:
{research_summary}

Write a short, personalized cold email (3-5 sentences max in the body).

Rules:
- Reference something SPECIFIC about their company or role from the research
- Connect it naturally to how the sender's product/service is relevant
- End with a soft CTA (suggest a quick call, not a hard sell)
- Sound human and conversational, NOT salesy or template-like
- Use their first name
- Keep subject line under 50 characters, make it specific not clickbaity

Return EXACTLY this JSON format (no markdown, just raw JSON):
{{
    "subject": "Subject line here",
    "body": "Full email body here including greeting and sign-off"
}}"""

    response = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
    return json.loads(text)
