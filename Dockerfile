FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Runner ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copy package files and prisma schema first
COPY --chown=nextjs:nodejs package*.json ./
COPY --chown=nextjs:nodejs --from=builder /app/prisma ./prisma

# Install deps and generate prisma client
RUN npm install --omit=dev && npx prisma generate

# Copy built output — all with --chown inline, no chown -R needed
COPY --chown=nextjs:nodejs --from=builder /app/.next/standalone ./
COPY --chown=nextjs:nodejs --from=builder /app/.next/static ./.next/static
COPY --chown=nextjs:nodejs --from=builder /app/public ./public
COPY --chown=nextjs:nodejs --from=builder /app/next.config.ts ./next.config.ts
COPY --chown=nextjs:nodejs --from=builder /app/middleware.ts ./middleware.ts
COPY --chown=nextjs:nodejs --from=builder /app/prisma.config.ts ./prisma.config.ts

USER nextjs

EXPOSE 3000

# Use standalone server — Next.js itself told you this in the warning:
# ⚠ "next start" does not work with "output: standalone"
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]