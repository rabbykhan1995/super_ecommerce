# Task 22 — ProductCard Component

> **Phase**: 7 — Product Components
> **Say**: "generate task 22" or "generate task 22"

## Objective

Create the product card component that mirrors the web version.

## Reference

`/ecommerce/components/Cards/ProductCard.tsx`

## File to Create

### `mobile/components/product/ProductCard.tsx`

## Design (from web reference)

```
┌─────────────────────────┐
│ [20% OFF]    [120 SOLD] │ ← Badges: top-left red, top-right green
│                         │
│                         │
│      [Product Image]    │ ← aspect-square, object-contain
│                         │
│                         │
├─────────────────────────┤
│ Product Name Here       │ ← numberOfLines={1}
│ ★★★★☆ (24)             │ ← Rating row
│ ৳599  ৳799             │ ← Green price + strikethrough
│ [Add to Cart]           │ ← Red button
└─────────────────────────┘
```

## Implementation

```tsx
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ShoppingCart, Star } from "lucide-react-native";
import ExpoImage from "expo-image";
import { getImageUrl } from "../../lib/utils";

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/products/[id]", params: { id: product._id } })}
      className="bg-white rounded-xl p-3 mb-3 flex-1 mx-1"
    >
      {/* Image Container */}
      <View className="relative">
        {/* Discount Badge */}
        {hasDiscount && (
          <View className="absolute top-1 left-1 z-10 bg-primary rounded-full px-2 py-0.5">
            <Text className="text-white text-xs font-bold">{discountPercent}% OFF</Text>
          </View>
        )}

        {/* Sold Badge */}
        {product.sold > 0 && (
          <View className="absolute top-1 right-1 z-10 bg-green-500 rounded-full px-2 py-0.5">
            <Text className="text-white text-xs font-bold">{product.sold} SOLD</Text>
          </View>
        )}

        {/* Product Image */}
        <ExpoImage
          source={{ uri: getImageUrl(product.image) }}
          className="w-full aspect-square rounded-lg"
          contentFit="contain"
          transition={300}
        />

        {/* Out of Stock */}
        {product.stock === 0 && (
          <View className="absolute inset-0 bg-black/50 rounded-lg items-center justify-center">
            <Text className="text-white font-bold">Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <Text className="font-medium text-gray-900 mt-2" numberOfLines={1}>
        {product.name}
      </Text>

      {/* Rating */}
      <View className="flex-row items-center gap-1 mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            color={star <= (product.rating || 0) ? "#F59E0B" : "#D1D5DB"}
            fill={star <= (product.rating || 0) ? "#F59E0B" : "#D1D5DB"}
          />
        ))}
        <Text className="text-xs text-gray-400 ml-1">({product.reviewCount || 0})</Text>
      </View>

      {/* Price */}
      <View className="flex-row items-center gap-2 mt-1">
        <Text className="text-green-600 font-bold">
          ৳{hasDiscount ? product.discountPrice : product.price}
        </Text>
        {hasDiscount && (
          <Text className="text-gray-400 line-through text-sm">৳{product.price}</Text>
        )}
      </View>

      {/* Add to Cart Button */}
      <Pressable className="bg-primary rounded-lg py-2 mt-2 items-center">
        <View className="flex-row items-center gap-1">
          <ShoppingCart size={14} color="white" />
          <Text className="text-white text-sm font-semibold">Add to Cart</Text>
        </View>
      </Pressable>
    </Pressable>
  );
}
```

## Key Points

- Discount badge: top-left, red bg (#F7311E), white text
- Sold badge: top-right, green bg
- Out of stock: gray overlay
- Image: `aspect-square` with `contentFit="contain"`
- Price: green with strikethrough for discount
- Cart button: red (#F7311E)
- Rating: 5-star row with count
- `expo-image` for caching and placeholders

## Verify

Renders correctly with all states: normal, discount, out of stock, no rating.
