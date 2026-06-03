# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps (cached unless package files change)
COPY package*.json ./
RUN npm ci

# Build the Nest app
COPY . .
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled output from the build stage
COPY --from=build /app/dist ./dist

EXPOSE 3002
CMD ["node", "dist/main"]
