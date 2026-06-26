CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  access_key VARCHAR(44),
  merchant_name TEXT NOT NULL,
  merchant_document VARCHAR(20),
  purchased_at TIMESTAMPTZ,
  total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount >= 0),
  raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS receipts_access_key_unique
  ON receipts(access_key)
  WHERE access_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  code TEXT,
  description TEXT NOT NULL,
  quantity NUMERIC(14, 4) NOT NULL CHECK (quantity > 0),
  unit TEXT,
  unit_price NUMERIC(14, 4) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(14, 2) NOT NULL CHECK (total_price >= 0),
  UNIQUE(receipt_id, position)
);

CREATE INDEX IF NOT EXISTS receipt_items_receipt_id_idx
  ON receipt_items(receipt_id);
