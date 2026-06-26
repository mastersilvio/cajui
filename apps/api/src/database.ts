import postgres from "postgres";
import { config } from "./config";

export const sql = postgres(config.databaseUrl, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

type ScrapedReceipt = {
  sourceUrl: string;
  accessKey?: string | null;
  merchantName: string;
  merchantDocument?: string | null;
  purchasedAt?: string | null;
  totalAmount: number;
  items: Array<{
    code?: string | null;
    description: string;
    quantity: number;
    unit?: string | null;
    unitPrice: number;
    totalPrice: number;
  }>;
};

export async function saveReceipt(receipt: ScrapedReceipt) {
  return sql.begin(async (transaction) => {
    if (receipt.accessKey) {
      const existing = await transaction`
        SELECT id FROM receipts WHERE access_key = ${receipt.accessKey}
      `;
      if (existing[0]) {
        return existing[0].id as string;
      }
    }

    const rows = await transaction`
      INSERT INTO receipts (
        source_url, access_key, merchant_name, merchant_document,
        purchased_at, total_amount, raw_data
      ) VALUES (
        ${receipt.sourceUrl},
        ${receipt.accessKey ?? null},
        ${receipt.merchantName},
        ${receipt.merchantDocument ?? null},
        ${receipt.purchasedAt ?? null},
        ${receipt.totalAmount},
        ${transaction.json(receipt)}
      )
      RETURNING id
    `;
    const id = rows[0]?.id as string;

    for (const [index, item] of receipt.items.entries()) {
      await transaction`
        INSERT INTO receipt_items (
          receipt_id, position, code, description, quantity,
          unit, unit_price, total_price
        ) VALUES (
          ${id}, ${index + 1}, ${item.code ?? null}, ${item.description},
          ${item.quantity}, ${item.unit ?? null}, ${item.unitPrice},
          ${item.totalPrice}
        )
      `;
    }

    return id;
  });
}

export async function findReceipt(id: string) {
  const receipts = await sql`
    SELECT
      id, source_url AS "sourceUrl", access_key AS "accessKey",
      merchant_name AS "merchantName", merchant_document AS "merchantDocument",
      purchased_at AS "purchasedAt", total_amount::float AS "totalAmount",
      created_at AS "createdAt"
    FROM receipts
    WHERE id = ${id}
  `;
  if (!receipts[0]) return null;

  const items = await sql`
    SELECT
      code, description, quantity::float AS quantity, unit,
      unit_price::float AS "unitPrice", total_price::float AS "totalPrice"
    FROM receipt_items
    WHERE receipt_id = ${id}
    ORDER BY position
  `;

  return { ...receipts[0], items };
}

export async function listReceipts() {
  return sql`
    SELECT
      id, source_url AS "sourceUrl", access_key AS "accessKey",
      merchant_name AS "merchantName", merchant_document AS "merchantDocument",
      purchased_at AS "purchasedAt", total_amount::float AS "totalAmount",
      created_at AS "createdAt",
      (SELECT COUNT(*)::int FROM receipt_items i WHERE i.receipt_id = receipts.id) AS "itemCount"
    FROM receipts
    ORDER BY created_at DESC
    LIMIT 100
  `;
}
