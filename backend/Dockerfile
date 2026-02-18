FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl

COPY package*.json ./
# Force install ALL deps including devDependencies (needed for nest build / ts-node)
RUN npm install --include=dev

COPY . .
RUN npx prisma generate
RUN npm run build
# Verify dist was created
RUN ls dist/main.js

EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx prisma db seed && node dist/main"]
