# Task 10 — Bottom Tab Navigator

> **Phase**: 3 — Navigation & Layout
> **Say**: "generate task 10" or "generate task 10"

## Objective

Set up the bottom tab navigation with 5 tabs: Home, Products, Cart, Track Order, Profile.

## Reference

`/ecommerce/components/Head&Foot/MobileBottomNav.tsx`

## Tabs Configuration

```
Home        — index        — 🏠 icon (Home from lucide-react-native)
Products    — products     — 📦 icon (Package)
Cart        — cart         — 🛒 icon (ShoppingCart) + badge (totalCartItems)
Track Order — track-order  — 📋 icon (ClipboardList)
Profile     — user         — 👤 icon (User) — or Login if unauthenticated
```

## Implementation

Use Expo Router tabs layout. Create `mobile/app/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from "expo-router";
import { ShoppingCart, Home, Package, ClipboardList, User } from "lucide-react-native";
import { useCartStore } from "../../store/cart.store";
import { useUserStore } from "../../store/user.store";

export default function TabLayout() {
  const totalCartItems = useCartStore((s) => s.totalCartItems);
  const user = useUserStore((s) => s.user);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#F7311E",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }} />
      <Tabs.Screen name="products" options={{ title: "Products", tabBarIcon: ({ color, size }) => <Package size={size} color={color} /> }} />
      <Tabs.Screen name="cart" options={{ title: "Cart", tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />, tabBarBadge: totalCartItems || undefined }} />
      <Tabs.Screen name="track-order" options={{ title: "Track", tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} /> }} />
      <Tabs.Screen name="user" options={{ title: user ? "Profile" : "Login", tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />
    </Tabs>
  );
}
```

## File Structure Update

Move page files into `(tabs)/` group:
```
app/
├── (tabs)/
│   ├── _layout.tsx        # Tab navigator
│   ├── index.tsx          # Home
│   ├── products.tsx       # Products
│   ├── cart.tsx           # Cart
│   ├── track-order.tsx    # Track Order
│   └── user.tsx           # Profile
├── _layout.tsx            # Root layout
├── login.tsx
├── registration.tsx
└── ...
```

## Verify

5 tabs visible at bottom, correct icons, cart badge shows item count, active tab highlighted in red.
