# Cache Revalidation (ISR Webhook)

## How It Works

Next.js caches pages using **cache tags** and **ISR (Incremental Static Regeneration)**. When data changes in the backend, a webhook invalidates the relevant cache tags so the next visitor sees fresh data.

### Flow

```
Admin updates data (product, flash sale, featured product, etc.)
  → Backend updates DB
  → Backend POSTs to Next.js /api/revalidate { tag | slug, secret }
  → Next.js validates secret, calls revalidateTag(...)
  → Next visitor gets fresh data
```

### Fallback

If the webhook fails (network error, server down), pages still refresh within **1 hour** via the `revalidate: 3600` fallback configured on each fetch.

---

## Cache Tags

| Tag | Page / Section | Triggered By |
|------|---------------|-------------|
| `product-${slug}` | `/product/[slug]` detail page | Product update |
| `home-flash-products` | Home page — Flash Sale section | Product CRUD, flash sale CRUD |
| `home-featured-products` | Home page — Featured Products section | Product CRUD, featured product add/remove |
| `home-offer-products` | Home page — Offer Products section | Product CRUD |

---

## Webhook Endpoint

**POST** `/api/revalidate`

### Request Body — Product Slug (existing)

```json
{
  "slug": "product-slug-here",
  "secret": "xK9m$vL2pQ8nR5tW3jY7"
}
```

Revalidates `product-${slug}` tag and `/products` path.

### Request Body — Generic Tag (new)

```json
{
  "tag": "home-flash-products",
  "secret": "xK9m$vL2pQ8nR5tW3jY7"
}
```

Revalidates the specified tag directly.

### Response

```json
{
  "revalidated": true,
  "tag": "home-flash-products",
  "timestamp": 1234567890
}
```

### Error Responses

- `401` — Invalid secret
- `400` — Missing slug and tag
- `500` — Revalidation failed

---

## Files

| File | Purpose |
|------|---------|
| `app/api/revalidate/route.ts` | Webhook endpoint (POST) — accepts `slug` or `tag` |
| `app/actions.ts` | Server actions for manual revalidation |
| `app/(with_footer)/page.tsx` | Home page — SSR with per-section cache tags |
| `app/(with_footer)/product/[slug]/page.tsx` | Product page — SSR with slug cache tag |
| `utils/homeApi.ts` | Server-side fetch functions for home page sections |

---

## Backend Revalidation Utility

**`backend/utils/revalidate.ts`** provides `triggerRevalidation(tags: string[])` — a reusable function that any controller can call to invalidate cache tags.

```ts
import { triggerRevalidation } from "../../utils/revalidate";

// Revalidate one or more tags
triggerRevalidation(["home-flash-products"]);
triggerRevalidation(["home-flash-products", "home-featured-products", "home-offer-products"]);
```

---

## Environment Variables

### Backend (`.env`)

```
NEXTJS_REVALIDATE_URL=http://localhost:3000
REVALIDATE_SECRET=xK9m$vL2pQ8nR5tW3jY7
```

### Ecommerce (`.env`)

```
REVALIDATE_SECRET=xK9m$vL2pQ8nR5tW3jY7
```

Both must match. Change the secret before deploying to production.

---

## Manual Revalidation

You can call the server action from any server component or server action:

```ts
import { refreshProductData } from "@/app/actions";

// Call with the product slug
await refreshProductData("my-product-slug");
```

---

## Security

- The webhook validates `REVALIDATE_SECRET` on every request
- Without a valid secret, the request is rejected with `401`
- Change the secret in production and keep it in environment variables only
