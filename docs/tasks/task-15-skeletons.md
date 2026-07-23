# Task 15 — Skeleton Components

> **Phase**: 4 — UI Primitives
> **Say**: "generate task 15" or "generate task 15"

## Objective

Create skeleton loading components for better UX during data fetches.

## Files to Create

### `mobile/components/skeleton/ProductCardSkeleton.tsx`

```tsx
import { View } from "react-native";

export default function ProductCardSkeleton() {
  return (
    <View className="bg-white rounded-xl p-3 mb-3">
      <View className="w-full aspect-square bg-gray-200 rounded-lg mb-2" />
      <View className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <View className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
      <View className="flex-row justify-between items-center">
        <View className="h-5 bg-gray-200 rounded w-1/3" />
        <View className="h-8 bg-gray-200 rounded w-8" />
      </View>
    </View>
  );
}
```

### `mobile/components/skeleton/BannerSkeleton.tsx`

```tsx
import { View } from "react-native";

export default function BannerSkeleton() {
  return (
    <View className="w-full h-48 bg-gray-200 rounded-xl mb-4" />
  );
}
```

### `mobile/components/skeleton/CategorySkeleton.tsx`

```tsx
import { View } from "react-native";

export default function CategorySkeleton() {
  return (
    <View className="flex-row gap-2 px-4 mb-4">
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="h-10 w-20 bg-gray-200 rounded-full" />
      ))}
    </View>
  );
}
```

## Key Points

- Use `bg-gray-200` for skeleton base color
- Rounded shapes match final component dimensions
- Import and use these in screens while data loads

## Verify

Render skeletons in a screen — shows placeholder shapes matching actual components.
