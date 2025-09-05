FROM node:20 AS base

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN <<EOF 
  apt-get update -y
  apt-get install libc6 libc++1 bash -y
  npm install -g pnpm@10.14.0
EOF

FROM base AS with-turbo
RUN npm install -g turbo

FROM with-turbo AS pruned-repo
WORKDIR /app

COPY . .
RUN turbo prune @enpitsu/yjs-server --docker

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
RUN CI=true SKIP_ENV_VALIDATION=true turbo run build --filter=@enpitsu/yjs-server...

WORKDIR /app/apps/yjs-server
RUN <<EOF
  mkdir -p /yjs-server
  pnpm pack --pack-destination /yjs-server/packed
  cd /yjs-server
  echo '{ "name": "yjs-server", "type": "module" }' > package.json
  pnpm add ./packed/enpitsu-yjs-server-0.1.0.tgz
EOF

# Debugging purpose
# RUN <<EOF
#   apt-get install tree
#   tree /question-processor
# EOF

FROM base AS runner
# Don't run production as root
RUN <<EOF 
  addgroup --system --gid 1001 nodejs
  adduser --system --uid 1001 processor
EOF

USER processor

COPY --from=builder --chown=processor:nodejs /yjs-server /yjs-server

WORKDIR /yjs-server

COPY <<EOF /yjs-server/index.js
"use strict";
import "@enpitsu/yjs-server";
EOF

CMD ["node", "index.js"]
