FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npx prisma generate --schema=prisma/schema-corporate.prisma

COPY . .
RUN npm run build && chmod +x docker-start.sh

EXPOSE 5000

CMD ["sh", "docker-start.sh"]
