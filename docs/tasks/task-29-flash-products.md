# Task 29 — FlashProductsSlider

> **Phase**: 8 — Home Screen
> **Say**: "generate task 29" or "generate task 29"

## Objective

Create a horizontal scrolling carousel for flash sale products.

## Reference

`/ecommerce/components/Sliders/FlashProductuSlider.tsx`

## File to Create

### `mobile/components/sliders/FlashProductsSlider.tsx`

## Implementation

```tsx
import { View, Text, FlatList } from "react-native";
import ProductCard from "../product/ProductCard";

interface FlashProductsSliderProps {
  products: any[];
}

export default function FlashProductsSlider({ products }: FlashProductsSliderProps) {
  if (!products || products.length === 0) return null;

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between px-4 mb-3">
        <View className="flex-row items-center gap-2">
          <View className="bg-red-500 rounded-full w-2 h-2" />
          <Text className="text-lg font-bold text-gray-900">Flash Sale</Text>
        </View>
        <Text className="text-primary text-sm font-medium">View All</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        ItemSeparatorComponent={() => <View className="w-2" />}
        renderItem={({ item }) => (
          <View className="w-[160px]">
            <ProductCard product={item} />
          </View>
        )}
      />
    </View>
  );
}
```

## Key Points

- Horizontal `FlatList` for smooth scrolling
- Section header with "Flash Sale" label
- Each card is 160px wide
- Reuses `ProductCard` component

## Verify

Horizontal scroll works, cards render at correct size, section header visible.
