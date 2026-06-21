# Etapa 1: instalación, pruebas y compilación
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig*.json ./
COPY src ./src
COPY test ./test

RUN npm run test
RUN npm run build

# Etapa 2: runtime productivo mínimo
FROM node:20-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=3000
ENV API_PREFIX=api

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "dist/main.js"]
