FROM node:20-alpine

WORKDIR /app

# Install server dependencies
COPY server/package.json ./server/
RUN cd server && npm install --production

# Install client dependencies and build
COPY client/package.json ./client/
RUN cd client && npm install
COPY client/ ./client/
RUN cd client && npm run build

# Copy server code
COPY server/ ./server/

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV LLAMACPP_URL=https://llm.aradhel.dev/v1

EXPOSE 3001

CMD ["node", "server/index.js"]
