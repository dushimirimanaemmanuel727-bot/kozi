# Use Node.js 20 Alpine as base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat openssl-dev
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl-dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
ENV PRISMA_FORCE_NAPI=true
ENV PRISMA_CLI_BINARY_TARGETS="linux-musl"
ENV OPENSSL_DIR="/usr/lib"
ENV OPENSSL_LIB_DIR="/usr/lib"
ENV OPENSSL_INCLUDE_DIR="/usr/include"
ENV PKG_CONFIG_PATH="/usr/lib/pkgconfig"
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install OpenSSL and additional dependencies for Prisma
RUN apk add --no-cache openssl curl

# Copy public files from builder stage
COPY --from=builder /app/public ./public/

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy Prisma files and migration files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/package.json ./package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Database migration and startup script
CMD ["sh", "-c", "echo '🚀 Starting application with database migration check...' && echo '📍 Environment: $NODE_ENV' && (if [ ! -z '$DATABASE_WAIT_TIMEOUT' ]; then echo '⏳ Waiting for database to be ready...' && timeout $DATABASE_WAIT_TIMEOUT sh -c 'until nc -z $DATABASE_HOST $DATABASE_PORT; do sleep 1; done'; fi) && echo '🗄️ Running database migrations...' && npx prisma migrate deploy || echo '⚠️ Migration failed or already applied' && echo '🔧 Generating Prisma client...' && npx prisma generate && echo '🎉 Starting application...' && node server.js"]
