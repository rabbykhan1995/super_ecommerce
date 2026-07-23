# Task 41 — My Cart Screen

> **Phase**: 11 — User Dashboard
> **Say**: "generate task 41" or "generate task 41"

## Objective

Create the "My Cart" screen in the user dashboard — shows the user's saved cart items.

## Reference

`/ecommerce/app/(dashboard)/user/my-cart/page.tsx`

## File to Create

### `mobile/app/user/my-cart.tsx`

## Implementation

```tsx
import { useEffect } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import CartItem from "../../components/cart/CartItem";
import Button from "../../components/ui/Button";
import { useCartStore } from "../../store/cart.store";

export default function MyCartScreen() {
  const router = useRouter();
  const { items, fetchCart, updateItem, removeItem, cartTotal } = useCartStore();

  useEffect(() => { fetchCart(); }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">My Cart</Text>
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-6xl mb-4">🛒</Text>
          <Text className="text-lg font-semibold text-gray-900 mb-2">Cart is empty</Text>
          <Button title="Browse Products" onPress={() => router.push("/products")} />
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <CartItem item={item} onUpdateQuantity={(id, qty) => updateItem(id, { quantity: qty })} onRemove={removeItem} />
            )}
          />
          <View className="bg-white p-4 border-t border-gray-100">
            <View className="flex-row justify-between mb-4">
              <Text className="text-lg font-bold">Total</Text>
              <Text className="text-lg font-bold text-primary">৳{cartTotal}</Text>
            </View>
            <Button title="Checkout" onPress={() => router.push("/checkout")} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
```

## Verify

My cart loads items, quantity controls work, checkout navigates.
