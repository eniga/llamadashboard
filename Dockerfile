FROM node:20-alpine AS builder

WORKDIR /app/client
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS server

WORKDIR /app/server
COPY server/package.json ./
RUN npm install --production
COPY server/ .

FROM node:20-alpine

WORKDIR /app

# Install dependencies for both server and client
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN cd server && npm install --production
RUN cd client && npm install

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
