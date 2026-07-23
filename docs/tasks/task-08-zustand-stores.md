# Task 08 — Zustand Stores (Cart, User, UI)

> **Phase**: 2 — Core Infrastructure
> **Say**: "generate task 8" or "generate task 08"

## Objective

Port Zustand stores from the web project. Same logic, replace `document.cookie` token source with SecureStore.

## Reference

- `/ecommerce/zustand/cart.store.ts`
- `/ecommerce/zustand/user.store.ts`
- `/ecommerce/zustand/openclose.store.ts`
- `/ecommerce/zustand/loading.store.ts`

## Files to Create

### `mobile/store/cart.store.ts`

Port from web with these changes:
- Replace `Helper.getToken()` → `AuthHelper.getToken()` from `lib/auth`
- Same API endpoints: `/cart/list`, `/cart/add`, `/cart/update/:id`, `/cart/remove/:id`, `/cart/clear`
- Same derived values: `totalCartItems`, `cartTotal`
- Keep slider state: `openCartSlider`, `setOpenCartSlider`

### `mobile/store/user.store.ts`

Port from web with these changes:
- Token via `AuthHelper` instead of cookies
- `fetchUser()` → GET `/auth/get-profile`
- `logout()` → GET `/auth/logout` + `AuthHelper.clearToken()`
- Navigate to login on logout (use `router.replace` or a navigation ref)

### `mobile/store/openclose.store.ts`

Copy as-is. No web-specific code.

### `mobile/store/loading.store.ts`

Copy as-is. No web-specific code.

## Key Store Behaviors

**Cart Store**:
```
fetchCart()        → GET  /cart/list
addItem(payload)   → POST /cart/add
updateItem(id, p)  → PUT  /cart/update/:id
removeItem(id)     → DELETE /cart/remove/:id
clearCart()        → DELETE /cart/clear
```

**User Store**:
```
fetchUser()  → GET /auth/get-profile
logout()     → GET /auth/logout + clear token
```

## Verify

1. Import `useCartStore` — call `fetchCart()` with valid token → should populate items
2. Import `useUserStore` — call `fetchUser()` → should set user data
3. Call `logout()` → token cleared, user null
