FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci


COPY . .
RUN npx prisma generate
RUN npm run build    

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 5001
USER node


# /live não consulta banco. start-period cobre o tempo do `prisma migrate
# deploy` no entrypoint, senão o container nasce unhealthy.
HEALTHCHECK --interval=60s --timeout=5s --start-period=40s --retries=3 \
 CMD node -e 'fetch("http://localhost:5001/live").then(res => { if (res.status !== 200) process.exit(1) }).catch(() => process.exit(1))'



ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/app/server.js"]