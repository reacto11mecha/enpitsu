FROM node:20 AS base
# LABEL fly_launch_runtime="Next.js"
ENV NEXT_TELEMETRY_DISABLED=1
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.

RUN <<EOF 
  apt-get update -y
  apt-get install libc6 libc++1 bash -y
  npm install -g pnpm
EOF

FROM base AS with-turbo
RUN npm install -g turbo

FROM with-turbo AS pruned-repo
WORKDIR /app

COPY . .
RUN turbo prune --scope=@enpitsu/admin --scope=@enpitsu/db --scope=@enpitsu/db-migrate --docker

FROM with-turbo as builder
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=pruned-repo /app/out/json/ .
COPY --from=pruned-repo /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build the project and its dependencies
COPY --from=pruned-repo /app/out/full/ .
COPY turbo.json turbo.json

## This would be useful for browser environment variables that are actually baked at build time and you aren't passing them in otherwise.
# COPY .env.production .env.production  
RUN CI=true SKIP_ENV_VALIDATION=true turbo run build --filter=@enpitsu/admin... --filter=@enpitsu/db-migrate...

WORKDIR /app/packages/db-migrate
RUN <<EOF
  mkdir -p /db-migrate
  pnpm pack --pack-destination /db-migrate
  cd /db-migrate
  pnpm i ./*.tgz
EOF

# This is the fly.io release_command that performs a migration
COPY <<EOF /db-migrate/db-migrate-release-command.sh 
  #!/bin/bash
  set -e
  cd /db-migrate
  CI=true pnpm exec db-migrate
EOF

FROM base AS runner
# Don't run production as root
RUN <<EOF 
  addgroup --system --gid 1001 nodejs
  adduser --system --uid 1001 nextjs
EOF

USER nextjs

COPY --from=builder --chown=nextjs:nodejs /db-migrate /db-migrate

WORKDIR /app

EXPOSE 3000
ENV PORT 3000

ENV NODE_ENV production

COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/next.config.mjs .
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/public ./apps/admin/public

COPY --from=pruned-repo /app/start.sh .
CMD ["/bin/sh", "/app/start.sh"]
