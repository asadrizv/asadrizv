import csv
import io
from dataclasses import dataclass


@dataclass
class ParsedLead:
    name: str
    email: str
    title: str | None = None
    company_name: str | None = None
    company_website: str | None = None
    linkedin_url: str | None = None


# Common header variations mapped to our fields
FIELD_MAP = {
    "name": "name",
    "full name": "name",
    "full_name": "name",
    "contact name": "name",
    "email": "email",
    "email address": "email",
    "email_address": "email",
    "title": "title",
    "job title": "title",
    "job_title": "title",
    "position": "title",
    "role": "title",
    "company": "company_name",
    "company name": "company_name",
    "company_name": "company_name",
    "organization": "company_name",
    "website": "company_website",
    "company website": "company_website",
    "company_website": "company_website",
    "url": "company_website",
    "linkedin": "linkedin_url",
    "linkedin url": "linkedin_url",
    "linkedin_url": "linkedin_url",
    "linkedin profile": "linkedin_url",
}


def parse_csv(content: str) -> list[ParsedLead]:
    """Parse CSV content into a list of leads. Handles various header formats."""
    reader = csv.DictReader(io.StringIO(content))

    if not reader.fieldnames:
        raise ValueError("CSV file has no headers")

    # Map CSV headers to our fields
    col_map = {}
    for header in reader.fieldnames:
        normalized = header.strip().lower()
        if normalized in FIELD_MAP:
            col_map[header] = FIELD_MAP[normalized]

    if "name" not in col_map.values():
        raise ValueError("CSV must have a 'name' column")
    if "email" not in col_map.values():
        raise ValueError("CSV must have an 'email' column")

    leads = []
    for row in reader:
        mapped = {}
        for csv_col, field in col_map.items():
            val = row.get(csv_col, "").strip()
            if val:
                mapped[field] = val

        if mapped.get("name") and mapped.get("email"):
            leads.append(ParsedLead(**{
                "name": mapped["name"],
                "email": mapped["email"],
                "title": mapped.get("title"),
                "company_name": mapped.get("company_name"),
                "company_website": mapped.get("company_website"),
                "linkedin_url": mapped.get("linkedin_url"),
            }))

    return leads
