from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, HttpUrl


class ScrapeRequest(BaseModel):
    url: HttpUrl


class ReceiptItem(BaseModel):
    description: str
    code: Optional[str] = None
    quantity: float = Field(gt=0)
    unit: Optional[str] = None
    unitPrice: float = Field(ge=0)
    totalPrice: float = Field(ge=0)


class ScrapedReceipt(BaseModel):
    sourceUrl: str
    accessKey: Optional[str] = None
    merchantName: str
    merchantDocument: Optional[str] = None
    purchasedAt: Optional[datetime] = None
    totalAmount: float = Field(ge=0)
    items: List[ReceiptItem]
