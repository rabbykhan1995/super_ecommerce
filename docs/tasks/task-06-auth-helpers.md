# Task 06 — Auth Helpers (SecureStore Token)

> **Phase**: 2 — Core Infrastructure
> **Say**: "generate task 6" or "generate task 06"

## Objective

Create token management helpers using `expo-secure-store`. Replaces the web's `document.cookie` approach.

## Reference

`/ecommerce/helper/helper.ts` (token-related functions)

## File to Create

### `mobile/lib/auth.ts`

```ts
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "token";

export const AuthHelper = {
  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async clearToken(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return !!token;
  },
};

export default AuthHelper;
```

## Auth Flow

1. Login → POST `/auth/login` → receive JWT → `AuthHelper.setToken(token)`
2. App startup → `AuthHelper.getToken()` → fetch profile
3. If profile succeeds → set user in store → navigate to home
4. If token missing/invalid → show login screen
5. 401 response → `AuthHelper.clearToken()` → redirect to login

## Verify

Call `AuthHelper.setToken("test")`, then `AuthHelper.getToken()` — should return `"test"`.
