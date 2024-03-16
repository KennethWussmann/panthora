FROM node:20-alpine AS builder
ARG VERSION
ENV VERSION ${VERSION}
ENV NEXT_PUBLIC_VERSION ${VERSION}
ENV SKIP_ENV_VALIDATION true
ENV NEXT_TELEMETRY_DISABLED 1

RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY . .

RUN npm i -g pnpm@8
RUN pnpm install --frozen-lockfile
RUN pnpm build --filter @panthora/app

##### RUNNER

FROM node:20-alpine AS runner
ARG VERSION
LABEL org.opencontainers.image.source https://github.com/KennethWussmann/panthora

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/packages/app/next.config.mjs ./
COPY --from=builder /app/packages/app/public ./public
COPY --from=builder /app/packages/app/package.json ./package.json
COPY --from=builder /app/docker-start.sh ./docker-start.sh
COPY --from=builder /app/packages/app/prisma ./prisma

COPY --from=builder --chown=nextjs:nodejs /app/packages/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME 0.0.0.0
ENV VERSION ${VERSION}
ENV NEXT_PUBLIC_VERSION ${VERSION}

CMD ["sh", "docker-start.sh"]