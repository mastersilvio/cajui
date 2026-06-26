export const config = {
  port: Number(Bun.env.API_PORT ?? 3300),
  databaseUrl:
    Bun.env.DATABASE_URL ?? "postgres://cajui:cajui@localhost:55432/cajui",
  scraperUrl: Bun.env.SCRAPER_URL ?? "http://localhost:8000",
};
