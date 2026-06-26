export type ReceiptItem = {
  description: string;
  code?: string | null;
  quantity: number;
  unit?: string | null;
  unitPrice: number;
  totalPrice: number;
};

export type Receipt = {
  id: string;
  sourceUrl: string;
  accessKey?: string | null;
  merchantName: string;
  merchantDocument?: string | null;
  purchasedAt?: string | null;
  totalAmount: number;
  createdAt: string;
  items: ReceiptItem[];
};

export type ImportReceiptInput = {
  url: string;
};

export type ApiError = {
  error: string;
  details?: string;
};
