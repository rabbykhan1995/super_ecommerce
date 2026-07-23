# Task 09 — Root Layout & Providers

> **Phase**: 3 — Navigation & Layout
> **Say**: "generate task 9" or "generate task 09"

## Objective

Create the root `_layout.tsx` that wraps the entire app with providers, toast, gesture handler, and safe area.

## File to Edit

### `mobile/app/_layout.tsx`

```tsx
import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { useUserStore } from "../store/user.store";
import AuthHelper from "../lib/auth";

export default function RootLayout() {
  const fetchUser = useUserStore((s) => s.fetchUser);

  useEffect(() => {
    const initAuth = async () => {
      const token = await AuthHelper.getToken();
      if (token) {
        try {
          await fetchUser();
        } catch {
          // Token invalid — handled by interceptor
        }
      }
    };
    initAuth();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

## Key Points

- `GestureHandlerRootView` — required for all gesture-based components
- `SafeAreaProvider` — provides safe area insets
- Auth check on startup — reads token, fetches profile
- `Toast` component mounted globally
- `StatusBar` — auto style (dark icons on light bg)

## Verify

App boots with no errors, toast works when triggered, gesture handler initialized.
