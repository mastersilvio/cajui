import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Receipt } from "@cajui/contracts";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3300";
type ReceiptSummary = Omit<Receipt, "items"> & { itemCount: number };

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function App() {
  const [url, setUrl] = useState("");
  const [receipts, setReceipts] = useState<ReceiptSummary[]>([]);
  const [selected, setSelected] = useState<Receipt | null>(null);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  const loadReceipts = useCallback(async () => {
    const response = await fetch(`${API_URL}/receipts`);
    if (response.ok) setReceipts(await response.json());
  }, []);

  useEffect(() => {
    void loadReceipts();
  }, [loadReceipts]);

  async function importReceipt(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const response = await fetch(`${API_URL}/receipts/import`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.details || result.error);
      setSelected(result);
      setUrl("");
      await loadReceipts();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao importar.");
    } finally {
      setStatus("idle");
    }
  }

  async function openReceipt(id: string) {
    const response = await fetch(`${API_URL}/receipts/${id}`);
    if (response.ok) setSelected(await response.json());
  }

  return (
    <main>
      <header className="hero">
        <div className="brand"><span>c</span> Cajui</div>
        <div className="hero-copy">
          <p className="eyebrow">Seu histórico de compras, sem digitação</p>
          <h1>Do cupom fiscal para uma vida mais organizada.</h1>
          <p>Escaneie o QR Code no celular ou cole abaixo o link da NFC-e.</p>
        </div>
        <form className="import-card" onSubmit={importReceipt}>
          <label htmlFor="receipt-url">Link do cupom fiscal</label>
          <div className="input-row">
            <input
              id="receipt-url"
              type="url"
              placeholder="https://...sefaz.../nfce..."
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
            />
            <button disabled={status === "loading"}>
              {status === "loading" ? "Importando…" : "Adicionar compra"}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      </header>

      <section className="content">
        <div>
          <div className="section-title">
            <div>
              <p className="eyebrow">Histórico</p>
              <h2>Compras recentes</h2>
            </div>
            <span>{receipts.length} cupons</span>
          </div>
          <div className="receipt-list">
            {receipts.length === 0 && (
              <div className="empty">Seu primeiro cupom vai aparecer aqui.</div>
            )}
            {receipts.map((receipt) => (
              <button
                className="receipt-row"
                key={receipt.id}
                onClick={() => void openReceipt(receipt.id)}
              >
                <span className="store-icon">⌁</span>
                <span>
                  <strong>{receipt.merchantName}</strong>
                  <small>{receipt.itemCount} itens</small>
                </span>
                <strong>{money.format(receipt.totalAmount)}</strong>
              </button>
            ))}
          </div>
        </div>

        <aside className="details">
          {selected ? (
            <>
              <p className="eyebrow">Detalhes da compra</p>
              <h2>{selected.merchantName}</h2>
              <div className="items">
                {selected.items.map((item, index) => (
                  <div className="item" key={`${item.description}-${index}`}>
                    <span>
                      <strong>{item.description}</strong>
                      <small>{item.quantity} {item.unit ?? "un"} × {money.format(item.unitPrice)}</small>
                    </span>
                    <strong>{money.format(item.totalPrice)}</strong>
                  </div>
                ))}
              </div>
              <div className="total">
                <span>Total</span>
                <strong>{money.format(selected.totalAmount)}</strong>
              </div>
            </>
          ) : (
            <div className="empty detail-empty">Selecione uma compra para ver os itens.</div>
          )}
        </aside>
      </section>
    </main>
  );
}
