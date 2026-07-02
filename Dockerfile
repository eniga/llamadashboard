FROM node:20-alpine AS builder

WORKDIR /app/client
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS server

WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
RUN npm ci --production
COPY server/ .

FROM node:20-alpine

WORKDIR /app

# Install dependencies for both server and client
COPY server/package.json server/package-lock.json* ./server/
COPY client/package.json client/package-lock.json* ./client/

RUN cd server && npm ci --production
RUN cd client && npm ci

# Copy built client assets
COPY --from=builder /app/client/dist ./client/dist

# Copy server files
COPY server/ ./server/

# Copy root package.json for concurrently
COPY package.json ./

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV LLAMACPP_URL=https://llm.aradhel.dev/v1

EXPOSE 3001

CMD ["node", "server/index.js"]
