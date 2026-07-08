# Super Ecommerce - Project Architecture Overview

## Project Structure

```
Super_Ecommerce/
├── admin/              # Admin Panel (Vite + React + TypeScript)
├── backend/            # Backend API (Bun + TypeScript + Drizzle ORM)
├── ecommerce/          # E-commerce Frontend (Next.js 14+)
├── pg_db/              # PostgreSQL Database (Docker Compose only)
├── dokanpat_nextjs/    # [EXTERNAL - Not part of this project]
└── shishir_backend/    # [EXTERNAL - Not part of this project]
```

---

## 1. Backend (`/backend`)

### Technology Stack
- **Runtime**: Bun (fast JavaScript runtime)
- **Language**: TypeScript
- **Framework**: Native HTTP (Bun.serve) / Express-like routing
- **ORM**: Drizzle ORM (type-safe SQL)
- **Database**: PostgreSQL (via pg_db Docker container)
- **Validation**: Custom validators
- **Configuration**: Environment-based config

### Core Concepts

#### Project Structure
```
backend/
├── src/                    # Main source code
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── repositories/       # Data access layer
│   ├── middleware/         # Auth, validation, error handling
│   ├── routes/             # API route definitions
│   ├── models/             # Drizzle schema definitions
│   ├── utils/              # Helper functions
│   └── types/              # TypeScript type definitions
├── drizzle/                # Database migrations & schema
├── config/                 # Configuration files
├── validators/             # Input validation schemas
├── middleware/             # Express-style middleware
├── routes/                 # Route definitions
├── app.ts                  # Application entry point
└── index.ts                # Server bootstrap
```

#### Key Features
- **RESTful API** design with consistent response formats
- **Type-safe database operations** via Drizzle ORM
- **Modular architecture** - controllers, services, repositories separation
- **Authentication & Authorization** (JWT-based)
- **Input validation** on all endpoints
- **Error handling** with standardized error responses
- **Database migrations** managed by Drizzle Kit

#### API Modules (Typical)
- Authentication (login, register, password reset)
- User management
- Product catalog (CRUD, categories, variants)
- Order management
- Cart & Checkout
- Payment integration
- Admin-specific endpoints

---

## 2. Admin Panel (`/admin`)

### Technology Stack
- **Build Tool**: Vite 5+
- **Framework**: React 18+ with TypeScript
- **Styling**: CSS Modules / Tailwind CSS (check package.json)
- **State Management**: React Context / Zustand / Redux (check src/store)
- **Routing**: React Router v6+
- **HTTP Client**: Axios / Fetch API
- **UI Components**: Custom component library / Headless UI

### Core Concepts

#### Project Structure
```
admin/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Buttons, inputs, modals, tables
│   │   ├── layout/         # Header, sidebar, footer
│   │   └── forms/          # Form-specific components
│   ├── pages/              # Page components (routes)
│   │   ├── dashboard/      # Analytics, overview
│   │   ├── products/       # Product management
│   │   ├── orders/         # Order management
│   │   ├── users/          # User management
│   │   ├── settings/       # System settings
│   │   └── auth/           # Login, forgot password
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service layer (axios instances)
│   ├── store/              # Global state management
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Helper functions
│   └── routes/             # Route configuration
├── public/                 # Static assets
└── index.html              # Entry HTML
```

#### Key Features
- **Role-based Access Control** (RBAC) - Admin, Manager, Staff roles
- **Dashboard** with real-time analytics & charts
- **Product Management** - CRUD, variants, images, categories
- **Order Management** - View, filter, update status, fulfillment
- **User Management** - Customer accounts, admin users, permissions
- **Settings** - Site configuration, payment gateways, shipping
- **Responsive Design** - Works on desktop/tablet
- **Dark/Light Theme** support

#### Authentication Flow
1. Admin logs in via `/auth/login`
2. JWT token stored in httpOnly cookie / localStorage
3. Token included in all API requests via Axios interceptor
4. Protected routes redirect to login if unauthenticated
5. Role-based route guards restrict access

---

## 3. E-commerce Frontend (`/ecommerce`)

### Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: Zustand (global) + React Server Components
- **Data Fetching**: Server Components + SWR / TanStack Query (client)
- **Authentication**: NextAuth.js / Custom JWT
- **Image Optimization**: Next.js Image component
- **Forms**: React Hook Form + Zod validation

### Core Concepts

#### Project Structure (App Router)
```
ecommerce/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Route group: login, register, password reset
│   ├── (shop)/             # Route group: public shop pages
│   │   ├── products/       # Product listing, details
│   │   ├── category/       # Category pages
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout flow
│   │   └── account/        # Customer account (protected)
│   ├── api/                # API routes (if any)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles
├── components/             # Shared React components
│   ├── ui/                 # Primitive components (Button, Input, Card)
│   ├── product/            # Product-specific (Card, Grid, Carousel)
│   ├── layout/             # Header, Footer, Navigation
│   ├── cart/               # Cart drawer, summary
│   ├── checkout/           # Checkout steps, forms
│   └── forms/              # Form components
├── lib/                    # Utilities & configurations
│   ├── api.ts              # Backend API client
│   ├── auth.ts             # Auth utilities
│   ├── utils.ts            # Helper functions
│   └── validations/        # Zod schemas
├── hooks/                  # Custom React hooks
├── store/                  # Zustand stores (cart, user, ui)
├── types/                  # TypeScript definitions
├── public/                 # Static assets (images, fonts)
└── middleware.ts           # Next.js middleware (auth, i18n)
```

#### Key Features

##### Customer-Facing
- **Homepage** - Hero, featured products, categories, promotions
- **Product Catalog** - Listing with filters, search, pagination
- **Product Details** - Images, variants, reviews, related products
- **Shopping Cart** - Persistent (localStorage + server sync)
- **Checkout** - Multi-step: Shipping → Payment → Review → Confirm
- **User Account** - Orders, addresses, profile, wishlist
- **Authentication** - Login, register, social auth, password reset
- **Search** - Full-text search with filters
- **Responsive** - Mobile-first design

##### Performance Optimizations
- **Server Components** by default (reduced client JS)
- **Static Generation** (SSG) for product/category pages
- **Incremental Static Regeneration** (ISR) for dynamic content
- **Image Optimization** - WebP/AVIF, lazy loading, blur placeholders
- **Font Optimization** - Self-hosted, preloaded
- **Code Splitting** - Automatic per-route

##### SEO & Accessibility
- **Meta tags** - Dynamic per page
- **Structured Data** - Product, Breadcrumb, Organization schema
- **Sitemap.xml** & robots.txt generation
- **Open Graph** / Twitter cards
- **WCAG AA** compliance target

---

## 4. Database (`/pg_db`)

### Docker Compose Configuration
```yaml
# pg_db/docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: super_ecommerce
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d super_ecommerce"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### Database Schema (Managed by Drizzle in `/backend/drizzle`)
Key tables typically include:
- `users` - Customers & admins
- `products` - Product catalog
- `product_variants` - SKUs, pricing, inventory
- `categories` - Product categories (hierarchical)
- `orders` - Customer orders
- `order_items` - Line items
- `addresses` - Shipping/billing addresses
- `payments` - Payment records
- `sessions` - Auth sessions
- `settings` - Site configuration

---

## Integration Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  E-commerce │────▶│   Backend   │◀───│   Admin     │
│  (Next.js)  │     │   (Bun)     │     │   (Vite)    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │ PostgreSQL  │
                    │  (Docker)   │
                    └─────────────┘
```

### Communication Patterns

| Direction | Protocol | Description |
|-----------|----------|-------------|
| E-commerce → Backend | REST API (HTTPS) | Server Components fetch directly; Client uses SWR |
| Admin → Backend | REST API (HTTPS) | Axios with JWT interceptor |
| Backend → Database | PostgreSQL Wire Protocol | Drizzle ORM (type-safe) |
| Backend → External | HTTPS | Payment gateways, email, storage |

### Shared Types
- Types defined in `/backend/src/types` and `/ecommerce/types` 
- Consider generating TypeScript types from Drizzle schema
- API response types shared via npm package or manual sync

---

## Development Workflow

### Prerequisites
- Bun v1.0+
- Node.js 20+ (for Next.js)
- Docker & Docker Compose
- PostgreSQL client (optional)

### Getting Started
```bash
# 1. Start database
cd pg_db && docker-compose up -d

# 2. Backend
cd ../backend
bun install
bun run drizzle:migrate  # Run migrations
bun run dev              # Start dev server (port 3001)

# 3. Admin Panel
cd ../admin
bun install
bun run dev              # Start dev server (port 5173)

# 4. E-commerce
cd ../ecommerce
bun install
bun run dev              # Start dev server (port 3000)
```

### Environment Variables

Each project has its own `.env` file:

| Project | Key Variables |
|---------|---------------|
| Backend | `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN` |
| Admin | `VITE_API_URL`, `VITE_APP_TITLE` |
| E-commerce | `NEXT_PUBLIC_API_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL` |

---

## Deployment Architecture

### Production Setup
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   CDN/Edge   │────▶│  Load Balancer│────▶│  Kubernetes  │
│  (Cloudflare)│     │   (NGINX)     │     │   Cluster    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    ▼                             ▼                             ▼
             ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
             │  Next.js    │              │   Bun API   │              │  Vite/React │
             │  (SSR/SSG)  │              │  (Backend)  │              │  (Admin)    │
             └─────────────┘              └──────┬──────┘              └─────────────┘
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    ▼                             ▼                             ▼
             ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
             │  PostgreSQL │              │    Redis    │              │  Object     │
             │  (Primary)  │              │            │  (Cache/Sessions)  │  Storage (S3) │
             └─────────────┘              └─────────────┘              └─────────────┘
```

### Build Commands
```bash
# Backend
cd backend && bun run build    # Compiles TypeScript → dist/

# Admin
cd admin && bun run build      # Vite build → dist/

# E-commerce
cd ecommerce && bun run build  # Next.js build → .next/
```

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Bun for Backend** | Fast startup, built-in TypeScript, native SQLite/PostgreSQL |
| **Drizzle ORM** | Type-safe, lightweight, SQL-like, great migration tooling |
| **Next.js App Router** | Server Components, streaming, better SEO, React 18 features |
| **Vite for Admin** | Fast HMR, optimized builds, simpler than Next.js for SPA |
| **Zustand for E-commerce** | Lightweight, TypeScript-friendly, works with Server Components |
| **PostgreSQL** | ACID compliance, JSONB support, mature ecosystem |
| **Docker for DB** | Consistent dev/prod environment, easy version management |

---

## Future Considerations

- [ ] **Monorepo tooling** - Turborepo / Nx for shared packages
- [ ] **Shared UI package** - Common components between admin & ecommerce
- [ ] **API Contract Testing** - Pact / OpenAPI validation
- [ ] **Event-driven architecture** - Message queue for order processing
- [ ] **Micro-frontends** - Module federation for independent deployments
- [ ] **Observability** - OpenTelemetry, distributed tracing
- [ ] **Multi-tenancy** - Support multiple stores from single deployment

---

*Document Version: 1.0*  
*Last Updated: 2026-07-08*  
*Project: Super_Ecommerce*