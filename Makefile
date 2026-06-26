.PHONY: dev infra test

dev:
	pnpm dev

infra:
	docker compose up --build

test:
	pnpm test
	cd services/scraper && python -m pytest
