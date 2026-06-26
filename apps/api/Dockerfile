FROM oven/bun:1.2.16-alpine

WORKDIR /app
COPY apps/api/package.json ./
RUN bun install
COPY apps/api/src ./src

EXPOSE 3300
CMD ["bun", "run", "src/index.ts"]
