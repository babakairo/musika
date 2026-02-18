FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN npx prisma generate

EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx prisma db seed && npx ts-node -r tsconfig-paths/register src/main.ts"]
