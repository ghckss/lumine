FROM node:22-alpine AS builder

WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@11.11.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/api-contracts/package.json packages/api-contracts/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile --filter @lumine/web...

COPY packages/api-contracts packages/api-contracts
COPY packages/domain packages/domain
COPY apps/web apps/web

ARG NEXT_PUBLIC_LUMINE_API_BASE_URL
ENV NEXT_PUBLIC_LUMINE_API_BASE_URL=${NEXT_PUBLIC_LUMINE_API_BASE_URL}
RUN pnpm turbo run build --filter=@lumine/web

FROM nginxinc/nginx-unprivileged:1.29-alpine AS runner

COPY apps/web/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/apps/web/out /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
