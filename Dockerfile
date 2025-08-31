# ---- build stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies (dev + prod)
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Remove dev dependencies, keep only production
RUN npm prune --omit=dev

# ---- runtime stage ----
FROM node:22-alpine AS runner
WORKDIR /app

# Copy runtime files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]
