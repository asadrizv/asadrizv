import httpx
from bs4 import BeautifulSoup


async def scrape_website(url: str) -> str:
    """Scrape a website and return cleaned text content."""
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"

    async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
        resp = await client.get(url, headers={
            "User-Agent": "Mozilla/5.0 (compatible; Rippleberry/1.0)"
        })
        resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "iframe"]):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)

    # Collapse blank lines and limit length
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines[:200])
