import re
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import List, Optional

from bs4 import BeautifulSoup, Tag

from .models import ReceiptItem, ScrapedReceipt


def _text(node: Optional[Tag]) -> str:
    return " ".join(node.get_text(" ", strip=True).split()) if node else ""


def _money(value: str) -> float:
    cleaned = re.sub(r"[^\d,.-]", "", value).replace(".", "").replace(",", ".")
    try:
        return float(Decimal(cleaned))
    except InvalidOperation:
        return 0.0


def _first(soup: BeautifulSoup, selectors: List[str]) -> Optional[Tag]:
    for selector in selectors:
        node = soup.select_one(selector)
        if node:
            return node
    return None


def _value_after_label(text: str, labels: List[str]) -> Optional[str]:
    for label in labels:
        match = re.search(rf"{label}\s*:?\s*([^\n|]+)", text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def _parse_item(row: Tag) -> Optional[ReceiptItem]:
    description = _text(
        row.select_one(
            ".txtTit, .descricao, .description, [class*='desc'], td:nth-of-type(1)"
        )
    )
    if not description:
        return None

    row_text = _text(row)
    quantity_text = _text(row.select_one(".Rqtd, .qtd, [class*='qtd']"))
    unit_text = _text(row.select_one(".RUN, .un, [class*='unidade']"))
    unit_price_text = _text(row.select_one(".RvlUnit, [class*='vlUnit'], .unit-price"))
    total_text = _text(
        row.select_one(".valor, .total, .RvlTotal, [class*='valor'], td:last-of-type")
    )
    code_match = re.search(r"(?:Código|Cód\.?)\s*:?\s*(\w+)", row_text, re.IGNORECASE)

    quantity = _money(quantity_text) or 1
    total = _money(total_text)
    unit_price = _money(unit_price_text) or (total / quantity if quantity else total)

    return ReceiptItem(
        description=description,
        code=code_match.group(1) if code_match else None,
        quantity=quantity,
        unit=unit_text.replace("UN:", "").strip() or None,
        unitPrice=unit_price,
        totalPrice=total or quantity * unit_price,
    )


def parse_receipt(html: str, source_url: str) -> ScrapedReceipt:
    soup = BeautifulSoup(html, "html.parser")
    page_text = soup.get_text("\n", strip=True)

    merchant = _text(
        _first(
            soup,
            [
                "#u20",
                ".txtTopo",
                ".emitente",
                ".merchant-name",
                "header h1",
                "h1",
            ],
        )
    )
    if not merchant:
        merchant = _value_after_label(page_text, ["Razão Social", "Emitente"]) or ""

    item_rows: List[Tag] = []
    for selector in [
        "#tabResult tr",
        "table#itens tr",
        ".item",
        ".produto",
        "[class*='item']",
    ]:
        rows = soup.select(selector)
        if rows:
            item_rows = rows
            break

    items = [item for row in item_rows if (item := _parse_item(row))]
    if not merchant or not items:
        raise ValueError(
            "A página foi acessada, mas o formato desta SEFAZ ainda não é reconhecido."
        )

    document_match = re.search(
        r"(?:CNPJ|CPF)\s*:?\s*([\d./-]{11,18})", page_text, re.IGNORECASE
    )
    access_key_match = re.search(r"\b(\d{44})\b", page_text)
    total_label = _value_after_label(
        page_text, ["Valor total", "Valor a pagar", "Total R\\$"]
    )
    total = _money(total_label or "") or sum(item.totalPrice for item in items)

    purchased_at = None
    date_match = re.search(
        r"(\d{2}/\d{2}/\d{4})\s*(?:às|[-–])?\s*(\d{2}:\d{2}(?::\d{2})?)?",
        page_text,
    )
    if date_match:
        value = f"{date_match.group(1)} {date_match.group(2) or '00:00'}"
        purchased_at = datetime.strptime(
            value, "%d/%m/%Y %H:%M:%S" if value.count(":") == 2 else "%d/%m/%Y %H:%M"
        )

    return ScrapedReceipt(
        sourceUrl=source_url,
        accessKey=access_key_match.group(1) if access_key_match else None,
        merchantName=merchant,
        merchantDocument=document_match.group(1) if document_match else None,
        purchasedAt=purchased_at,
        totalAmount=round(total, 2),
        items=items,
    )
