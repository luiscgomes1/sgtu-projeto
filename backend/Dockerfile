FROM node:22-alpine

RUN apk add --no-cache tzdata
ENV TZ=America/Sao_Paulo

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .
RUN chown -R appuser:appgroup /app

USER appuser

RUN npx prisma generate

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

CMD ["node", "--experimental-strip-types", "--env-file=.env", "src/server.js"]
