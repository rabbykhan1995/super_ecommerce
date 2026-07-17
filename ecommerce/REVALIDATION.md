# Product Cache Revalidation (ISR Webhook)

## How It Works

Next.js caches product slug pages (`/product/[slug]`) using **cache tags** and **ISR (Incremental Static Regeneration)**. When a product is updated in the backend, the cache must be invalidated so the next visitor sees fresh data.

### Flow

```
Admin updates product (PUT /api/product/update/:id)
  → Backend updates DB
  → Backend fetches product slug by ID
  → Backend POSTs to Next.js /api/revalidate { slug, secret }
  → Next.js validates secret, calls revalidateTag('product-${slug}')
  → Next.js also revalidates /products listing
  → Next visitor to /product/{slug} gets fresh data
```

### Fallback

If the webhook fails (network error, server down), pages still refresh within **1 hour** via the `revalidate: 3600` fallback configured on the product fetch.

## Files

| File | Purpose |
|------|---------|
| `app/api/revalidate/route.ts` | Webhook endpoint (POST) |
| `app/actions.ts` | Server actions for manual revalidation |
| `app/(with_footer)/product/[slug]/page.tsx` | Product page with cache tags + ISR fallback |

## Webhook Endpoint

**POST** `/api/revalidate`

### Request Body

```json
{
  "slug": "product-slug-here",
  "secret": "xK9m$vL2pQ8nR5tW3jY7"
}
```

### Response

```json
{
  "revalidated": true,
  "slug": "product-slug-here",
  "timestamp": 1234567890
}
```

### Error Responses

- `401` — Invalid secret
- `400` — Missing slug
- `500` — Revalidation failed

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

## Manual Revalidation

You can call the server action from any server component or server action:

```ts
import { refreshProductData } from "@/app/actions";

// Call with the product slug
await refreshProductData("my-product-slug");
```

## Security

- The webhook validates `REVALIDATE_SECRET` on every request
- Without a valid secret, the request is rejected with `401`
- Change the secret in production and keep it in environment variables only
