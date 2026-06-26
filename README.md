# Cajui

O Cajui transforma o QR Code ou link de uma NFC-e em um histórico estruturado
de compras. O MVP lê a página do cupom, extrai estabelecimento, total e itens,
e persiste tudo no PostgreSQL.

## Estrutura

```text
apps/
  api/       API Elysia.js
  web/       aplicação React
  mobile/    aplicativo Expo/React Native
packages/
  contracts/ contratos TypeScript compartilhados
services/
  scraper/   acesso e parsing de NFC-e em Python
infra/
  postgres/  schema inicial
```

## Executar com Docker

Pré-requisito: Docker com Compose.

```bash
cp .env.example .env
docker compose up --build
```

- Web: http://localhost:55173
- API: http://localhost:3300
- Scraper/OpenAPI: http://localhost:8000/docs
- PostgreSQL: localhost:55432

## Aplicativo móvel

Com os serviços Docker ativos:

```bash
corepack enable
pnpm install
EXPO_PUBLIC_API_URL=http://SEU_IP_NA_REDE:3300 pnpm --filter @cajui/mobile dev
```

Em um aparelho físico, `localhost` aponta para o próprio telefone. Por isso,
use o IP da máquina que está executando a API.

## Fluxo da importação

1. O web recebe um link manual; o mobile recebe o link ou lê um QR Code.
2. A API valida a URL e pede ao scraper que acesse a página.
3. O scraper resolve o endereço novamente para bloquear redes privadas, limita
   redirecionamentos e interpreta o HTML.
4. A API salva a compra e seus itens em uma transação.
5. A chave de acesso da NFC-e, quando encontrada, evita duplicatas.

## Adaptação por estado

Os portais de NFC-e brasileiros não usam um HTML único. O parser em
`services/scraper/app/parser.py` cobre seletores comuns e foi desenhado para
receber adaptadores específicos por SEFAZ conforme cupons reais forem
testados. Portais que exigem CAPTCHA ou JavaScript precisarão de um adaptador
com navegador automatizado ou integração oficial.

## Testes

```bash
pnpm --filter @cajui/api test
cd services/scraper && python -m pytest
```
