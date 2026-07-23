# Task 12 — BottomNav Component

> **Phase**: 3 — Navigation & Layout
> **Say**: "generate task 12" or "generate task 12"

## Objective

Create a custom BottomNav component (if not using Expo Router tabs directly). This is an alternative to Task 10 — use one or the other.

## Reference

`/ecommerce/components/Head&Foot/MobileBottomNav.tsx`

## File to Create

### `mobile/components/layout/BottomNav.tsx`

### Design

Fixed bottom bar with 5 icons. Used within screen layouts if not using Expo Router tab navigator.

### Implementation

```tsx
import { View, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Package, ShoppingCart, ClipboardList, User } from "lucide-react-native";
import { useRouter, usePathname } from "expo-router";
import { useCartStore } from "../../store/cart.store";

const tabs = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Products", icon: Package, path: "/products" },
  { name: "Cart", icon: ShoppingCart, path: "/cart" },
  { name: "Track", icon: ClipboardList, path: "/track-order" },
  { name: "Profile", icon: User, path: "/user" },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const totalCartItems = useCartStore((s) => s.totalCartItems);

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="flex-row bg-white border-t border-gray-200 px-2 pt-2"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.path || pathname.startsWith(tab.path + "/");
        const Icon = tab.icon;
        return (
          <Pressable
            key={tab.name}
            onPress={() => router.push(tab.path)}
            className="flex-1 items-center py-1"
          >
            <View className="relative">
              <Icon size={22} color={isActive ? "#F7311E" : "#9CA3AF"} />
              {tab.name === "Cart" && totalCartItems > 0 && (
                <View className="absolute -top-1.5 -right-2 bg-primary rounded-full w-4 h-4 items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">{totalCartItems}</Text>
                </View>
              )}
            </View>
            <Text className={`text-[10px] mt-0.5 ${isActive ? "text-primary font-semibold" : "text-gray-500"}`}>
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
```

## Key Points

- Respects safe area bottom inset (home indicator)
- Active tab highlighted in red (#F7311E)
- Cart badge shows item count
- Use this if NOT using Expo Router tab navigator

## Verify

Bottom bar renders, icons correct, active state works, badge shows count.
