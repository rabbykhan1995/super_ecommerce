# Task 30 — FeaturedProducts Section

> **Phase**: 8 — Home Screen
> **Say**: "generate task 30" or "generate task 30"

## Objective

Create a 2-column product grid for featured products.

## Reference

`/ecommerce/components/Sections/FeaturedProducts.tsx`

## File to Create

### `mobile/components/sections/FeaturedProducts.tsx`

## Implementation

```tsx
import { View, Text, FlatList } from "react-native";
import ProductCard from "../product/ProductCard";

interface FeaturedProductsProps {
  products: any[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <View className="mb-6 px-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-900">Featured Products</Text>
        <Text className="text-primary text-sm font-medium">View All</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={{ gap: 8 }}
        renderItem={({ item }) => (
          <View className="flex-1">
            <ProductCard product={item} />
          </View>
        )}
      />
    </View>
  );
}
```

## Key Points

- `numColumns={2}` for 2-column grid (no 3-column desktop layout)
- `scrollEnabled={false}` — parent ScrollView handles scrolling
- Uses `ProductCard` component
- Matches web's `FeaturedProducts` layout

## Verify

2-column grid renders, cards display correctly, no scroll conflict with parent.
