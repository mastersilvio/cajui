import { cors } from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import { config } from "./config";
import { findReceipt, listReceipts, saveReceipt, sql } from "./database";
import { validateReceiptUrl } from "./url-policy";

const app = new Elysia()
  .use(cors())
  .get("/health", async () => {
    await sql`SELECT 1`;
    return { status: "ok" };
  })
  .get("/receipts", () => listReceipts())
  .get(
    "/receipts/:id",
    async ({ params, set }) => {
      if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(params.id)) {
        set.status = 400;
        return { error: "Identificador de compra inválido." };
      }
      const receipt = await findReceipt(params.id);
      if (!receipt) {
        set.status = 404;
        return { error: "Compra não encontrada." };
      }
      return receipt;
    },
    { params: t.Object({ id: t.String() }) },
  )
  .post(
    "/receipts/import",
    async ({ body, set }) => {
      try {
        if (body.url.length > 2048) {
          set.status = 400;
          return { error: "O link informado é muito longo." };
        }
        const url = validateReceiptUrl(body.url);
        const response = await fetch(`${config.scraperUrl}/scrape`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: url.toString() }),
          signal: AbortSignal.timeout(30_000),
        });

        const result = (await response.json()) as Record<string, unknown>;
        if (!response.ok) {
          set.status = response.status >= 500 ? 502 : 422;
          return {
            error: "Não foi possível interpretar esse cupom.",
            details: String(result.detail ?? ""),
          };
        }

        const id = await saveReceipt(result as never);
        set.status = 201;
        return await findReceipt(id);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro inesperado.";
        set.status =
          message.includes("link") || message.includes("endereço") ? 400 : 502;
        return { error: message };
      }
    },
    {
      body: t.Object({
        url: t.String(),
      }),
    },
  )
  .onError(({ error, set }) => {
    console.error(error);
    set.status = 500;
    return { error: "Erro interno do servidor." };
  })
  .listen(config.port);

console.log(`Cajui API disponível em http://localhost:${app.server?.port}`);

export type App = typeof app;
