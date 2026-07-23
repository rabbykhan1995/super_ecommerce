# Task 31 — OfferProducts Section

> **Phase**: 8 — Home Screen
> **Say**: "generate task 31" or "generate task 31"

## Objective

Create a 2-column product grid for offer/discounted products.

## Reference

`/ecommerce/components/Sections/OfferProducts.tsx`

## File to Create

### `mobile/components/sections/OfferProducts.tsx`

## Implementation

```tsx
import { View, Text, FlatList } from "react-native";
import ProductCard from "../product/ProductCard";

interface OfferProductsProps {
  products: any[];
}

export default function OfferProducts({ products }: OfferProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <View className="mb-6 px-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-900">Special Offers</Text>
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

## Verify

2-column grid renders, offers display correctly.
