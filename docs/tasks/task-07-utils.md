# Task 07 — Utility Functions

> **Phase**: 2 — Core Infrastructure
> **Say**: "generate task 7" or "generate task 07"

## Objective

Port utility/helper functions from the web project. Remove web-specific APIs (`document`, `window`).

## Reference

`/ecommerce/helper/helper.ts`

## File to Create

### `mobile/lib/utils.ts`

Key functions to port:

| Function | Purpose | Changes |
|----------|---------|---------|
| `formatPrice(amount)` | Format number to currency string | None |
| `truncateText(text, limit)` | Truncate long text | None |
| `getImageUrl(path)` | Build full image URL from relative path | Use `EXPO_PUBLIC_API_URL` |
| `calculateDiscount(price, originalPrice)` | Calculate discount percentage | None |
| `timeAgo(date)` | Relative time string | None |
| `slugify(text)` | Convert text to slug | None |

## Instructions

1. Read `/ecommerce/helper/helper.ts`
2. Copy all non-DOM functions
3. Replace any `NEXT_PUBLIC_API_URL` references with `process.env.EXPO_PUBLIC_API_URL`
4. Remove any `document.*` or `window.*` calls
5. Add `getImageUrl` if not present:

```ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "https://via.placeholder.com/300";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}
```

## Verify

Import and call each function — should return expected results without DOM errors.
