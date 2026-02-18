FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN npx prisma generate

# Compile TypeScript directly (bypass nest CLI)
RUN npx tsc --project tsconfig.json

# Show what was built
RUN find /app/dist -type f -name "*.js" | head -20

EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx prisma db seed && node dist/main"]
