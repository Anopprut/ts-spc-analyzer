FROM node:22-alpine

ENV NODE_ENV=production PORT=3000
WORKDIR /app

# No dependencies to install: Node runs the TypeScript sources directly.
COPY package.json ./
COPY src ./src

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "src/server.ts"]
