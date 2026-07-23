# Task 13 — Auth Guard Layout (User Routes)

> **Phase**: 3 — Navigation & Layout
> **Say**: "generate task 13" or "generate task 13"

## Objective

Create a layout component that protects user dashboard routes. Redirects to login if no token.

## Reference

`/ecommerce/middleware.ts`

## File to Create

### `mobile/app/user/_layout.tsx`

```tsx
import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import AuthHelper from "../../lib/auth";

export default function UserLayout() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await AuthHelper.isAuthenticated();
      if (!isAuth) {
        router.replace("/login");
      } else {
        setChecking(false);
      }
    };
    checkAuth();
  }, []);

  if (checking) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F7311E" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
```

## Protected Routes

All routes under `/user/*` require authentication:
- `/user` — Dashboard
- `/user/profile` — Profile
- `/user/settings` — Settings
- `/user/my-cart` — My Cart
- `/user/my-orders` — Order list
- `/user/my-orders/[orderNo]` — Order detail

## Flow

1. User navigates to `/user/profile`
2. `_layout.tsx` checks `AuthHelper.isAuthenticated()`
3. If false → redirect to `/login`
4. If true → render child screen
5. Show loading spinner while checking

## Verify

Navigate to `/user` while logged out — should redirect to login.
Navigate while logged in — should show dashboard.
