# Musika — Zimbabwe's Online Marketplace

> A production-ready, investor-grade eCommerce marketplace platform built for Zimbabwe.
> Pay with EcoCash. Sell from anywhere. Deliver everywhere.

---

## Architecture Overview

```
Musika/
├── backend/                    # NestJS REST API
│   ├── src/
│   │   ├── modules/            # Feature modules (auth, products, orders, payments, admin, sellers)
│   │   ├── common/             # Guards, decorators, filters, interceptors
│   │   └── prisma/             # Prisma service & module
│   ├── prisma/
│   │   ├── schema.prisma       # Full database schema
│   │   └── seed.ts             # Seed with realistic Zimbabwean data
│   └── Dockerfile
├── frontend/                   # Next.js 14 App Router
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   ├── components/         # Reusable UI components
│   │   ├── store/              # Zustand state (cart, auth)
│   │   ├── lib/                # API client, utilities
│   │   └── types/              # TypeScript types
│   └── Dockerfile
└── docker-compose.yml          # Full stack with PostgreSQL + Redis
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| State | Zustand (cart + auth) |
| Data Fetching | TanStack Query + Axios |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (RS256) + bcrypt |
| Payments | EcoCash (mock — production-ready structure) |
| Cache | Redis |
| Containerization | Docker + Docker Compose |

---

## Quick Start (Docker — Recommended)

### Prerequisites
- Docker Desktop installed
- Git

### 1. Clone and configure

```bash
git clone <repo-url>
cd Musika
cp .env.example .env
```

### 2. Start everything

```bash
docker compose up --build
```

This will:
- Start PostgreSQL on port 5432
- Start Redis on port 6379
- Run Prisma migrations
- Seed the database with sample data
- Start the API on http://localhost:3001
- Start the frontend on http://localhost:3000

### 3. Access the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001/api/v1 |
| API Health | http://localhost:3001/api/v1/auth/me |

---

## Manual Setup (Development)

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Backend

```bash
cd backend
npm install
cp ../.env.example .env  # Update DATABASE_URL to your local PostgreSQL

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database
npx ts-node prisma/seed.ts

# Start development server
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local  # Update NEXT_PUBLIC_API_URL if needed

npm run dev
```

---

## Demo Credentials

After seeding, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@musika.co.zw | Password123! |
| Seller 1 (TechZim) | techstore@musika.co.zw | Password123! |
| Seller 2 (Fashion Hub) | fashionhub@musika.co.zw | Password123! |
| Customer | customer@musika.co.zw | Password123! |

The login page includes **one-click demo buttons** for quick access.

---

## API Reference

### Authentication
```
POST /api/v1/auth/register     Register new account
POST /api/v1/auth/login        Login
GET  /api/v1/auth/me           Get current user (JWT required)
```

### Products
```
GET  /api/v1/products                    List products (pagination, filters)
GET  /api/v1/products/categories         Get all categories
GET  /api/v1/products/:slug              Get product by slug
POST /api/v1/products                    Create product (SELLER)
PUT  /api/v1/products/:id               Update product (SELLER)
GET  /api/v1/products/my-products       Seller's own products (SELLER)
```

### Orders
```
POST  /api/v1/orders            Create order
GET   /api/v1/orders            My orders (CUSTOMER)
GET   /api/v1/orders/:id        Order detail
PATCH /api/v1/orders/:id/status  Update status (ADMIN/SELLER)
```

### Payments (EcoCash)
```
POST /api/v1/payments/initiate           Initiate EcoCash payment
GET  /api/v1/payments/:id/status        Check payment status
POST /api/v1/payments/webhook/ecocash   Webhook (simulate success/fail)
```

### Admin
```
GET   /api/v1/admin/dashboard           Platform analytics
GET   /api/v1/admin/users               All users (paginated)
GET   /api/v1/admin/sellers             All sellers
PATCH /api/v1/admin/sellers/:id/approve  Approve seller
GET   /api/v1/admin/orders              All orders (paginated)
PATCH /api/v1/admin/orders/:id/status   Change order status
```

---

## Order State Machine

```
PENDING → PAID → PACKED → SHIPPED → DELIVERED
    ↓         ↓
CANCELLED   CANCELLED
```

- **PENDING**: Order created, stock reserved, awaiting payment
- **PAID**: EcoCash confirmed, stock deducted from inventory
- **PACKED**: Warehouse has prepared the order
- **SHIPPED**: Order dispatched for delivery/agent pickup
- **DELIVERED**: Customer confirmed receipt
- **CANCELLED**: Order cancelled, reserved stock released

---

## EcoCash Integration

The MVP uses a **mock EcoCash flow** that simulates the real API structure:

1. Customer initiates payment → `POST /payments/initiate` (returns mock reference)
2. EcoCash sends webhook → `POST /payments/webhook/ecocash`
3. System updates order status → `PAID`

**To integrate real EcoCash:**
1. Replace `PaymentsService.initiate()` with actual EcoCash API call
2. Add HMAC signature verification to the webhook handler
3. Set `ECOCASH_MERCHANT_CODE`, `ECOCASH_MERCHANT_PIN`, `ECOCASH_WEBHOOK_SECRET` in `.env`

---

## Database Schema

```
users ──────── sellers ──────── products ──── inventory
   │                               │
   └──────── orders ────────── order_items
                │
                └──── payments
                └──── agent_locations
```

Key design decisions:
- **Inventory tracking**: `quantityAvailable`, `quantityReserved`, `quantitySold` — stock reserved on order creation, deducted on payment
- **Soft deletes**: Products use `active: boolean` to avoid cascade issues
- **Proper indexes**: All foreign keys and frequently queried fields are indexed
- **Audit trail**: All entities have `createdAt`/`updatedAt` timestamps

---

## Security Features

- ✅ Passwords hashed with bcrypt (12 salt rounds)
- ✅ JWT authentication with role-based access control
- ✅ Input validation via `class-validator` DTOs
- ✅ Global rate limiting (100 req/min via `@nestjs/throttler`)
- ✅ CORS configured for frontend origin only
- ✅ SQL injection prevented via Prisma ORM parameterization
- ✅ XSS prevented via React's built-in escaping + strict CSP headers
- ✅ Sensitive config via environment variables only

---

## Scaling Considerations

For production/post-MVP:

| Concern | Solution |
|---------|---------|
| Image storage | Replace URL references with S3/Cloudflare R2 upload |
| Search | Add Elasticsearch or Algolia for full-text product search |
| Caching | Redis already wired — add cache layer to ProductsService |
| Email | Integrate SendGrid/Mailgun for order confirmations |
| Background jobs | Add Bull queue for order processing, notifications |
| Monitoring | Add Sentry for error tracking, Datadog for metrics |
| Database | PostgreSQL read replicas for scaling reads |

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) | ✅ |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) | ✅ |
| `FRONTEND_URL` | Frontend URL for CORS | ✅ |
| `ECOCASH_MERCHANT_CODE` | EcoCash merchant code | Production |
| `ECOCASH_WEBHOOK_SECRET` | Webhook HMAC secret | Production |

---

## Seed Data Included

- **6 product categories**: Electronics, Fashion, Home & Kitchen, Sports, Beauty, Books
- **12 realistic products** with Zimbabwean context and Unsplash images
- **3 seller accounts** with approved status
- **6 agent pickup locations** across Harare, Bulawayo, Gweru, Mutare
- **1 completed sample order** with payment

---

## Contact

Built for the Zimbabwean market. Investor inquiries: hello@musika.co.zw

---

*Built with ❤️ for Zimbabwe. Powered by NestJS, Next.js, and EcoCash.*
