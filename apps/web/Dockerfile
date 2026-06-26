FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY packages/contracts ./packages/contracts
COPY apps/web ./apps/web
RUN pnpm install --filter @cajui/web... --frozen-lockfile=false
ARG VITE_API_URL=http://localhost:3300
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @cajui/web build

FROM nginx:1.27-alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
