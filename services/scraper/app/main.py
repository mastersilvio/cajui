from typing import Dict

import httpx
from fastapi import FastAPI, HTTPException

from .models import ScrapeRequest, ScrapedReceipt
from .parser import parse_receipt
from .security import ensure_public_url

app = FastAPI(title="Cajui Scraper", version="0.1.0")


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/scrape", response_model=ScrapedReceipt)
async def scrape(request: ScrapeRequest) -> ScrapedReceipt:
    url = str(request.url)
    try:
        ensure_public_url(url)
        async with httpx.AsyncClient(
            follow_redirects=False,
            timeout=20,
            headers={"User-Agent": "Cajui/0.1 (+receipt importer)"},
        ) as client:
            response = await client.get(url)
            for _ in range(5):
                if not response.is_redirect:
                    break
                redirect = str(response.next_request.url)
                ensure_public_url(redirect)
                response = await client.send(response.next_request)
            response.raise_for_status()
        return parse_receipt(response.text, url)
    except (ValueError, httpx.HTTPError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
