# Task 34 — CartItem Component

> **Phase**: 10 — Cart & Checkout
> **Say**: "generate task 34" or "generate task 34"

## Objective

Create a single cart item row component.

## File to Create

### `mobile/components/cart/CartItem.tsx`

## Implementation

```tsx
import { View, Text, Pressable } from "react-native";
import ExpoImage from "expo-image";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import { getImageUrl } from "../../lib/utils";

interface CartItemProps {
  item: any;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <View className="flex-row p-4 bg-white border-b border-gray-50">
      <ExpoImage
        source={{ uri: getImageUrl(item.product?.image) }}
        className="w-20 h-20 rounded-lg"
        contentFit="contain"
        transition={200}
      />

      <View className="flex-1 ml-3">
        <Text className="font-medium text-gray-900" numberOfLines={1}>
          {item.product?.name}
        </Text>

        {item.variant && (
          <Text className="text-xs text-gray-500 mt-0.5">{item.variant.name}</Text>
        )}

        <Text className="text-primary font-semibold mt-1">৳{item.price}</Text>

        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => onUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
              className="bg-gray-100 rounded-lg p-1.5"
            >
              <Minus size={14} color="#4B5563" />
            </Pressable>
            <Text className="font-medium text-gray-900 w-8 text-center">{item.quantity}</Text>
            <Pressable
              onPress={() => onUpdateQuantity(item._id, item.quantity + 1)}
              className="bg-gray-100 rounded-lg p-1.5"
            >
              <Plus size={14} color="#4B5563" />
            </Pressable>
          </View>

          <Pressable onPress={() => onRemove(item._id)} className="p-1.5">
            <Trash2 size={18} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
```

## Verify

Renders correctly with image, name, price, quantity controls, remove button.
