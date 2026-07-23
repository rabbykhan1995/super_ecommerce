# Task 17 — CartSlider (Slide from Right)

> **Phase**: 5 — Gesture Sliders
> **Say**: "generate task 17" or "generate task 17"

## Objective

Create a gesture-driven cart drawer that slides from the right side.

## Reference

`/ecommerce/components/Sliders/CartSlider.tsx`

## File to Create

### `mobile/components/sliders/CartSlider.tsx`

## Web vs Mobile

| Web (Framer Motion) | Mobile (Reanimated) |
|---|---|
| `motion.div` translateX | `useAnimatedStyle` with translateX |
| `AnimatePresence` | `Animated.View` with conditional render |
| `framer-motion` spring | `withSpring(0, { damping: 25, stiffness: 300 })` |
| `sm:w-[420px]` | Full screen width |

## Implementation

```tsx
import { useEffect } from "react";
import { View, Text, Pressable, FlatList, Image } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { X, Trash2, Plus, Minus } from "lucide-react-native";
import { useCartStore } from "../../store/cart.store";
import { useOpenCloseState } from "../../store/openclose.store";
import { getImageUrl } from "../../lib/utils";

export default function CartSlider() {
  const { openCartSlider, setOpenCartSlider } = useOpenCloseState();
  const { items, removeItem, updateItem, totalCartItems, cartTotal, clearCart } = useCartStore();

  const translateX = useSharedValue(400);

  useEffect(() => {
    translateX.value = openCartSlider ? 0 : 400;
  }, [openCartSlider]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(translateX.value, { damping: 25, stiffness: 300 }) }],
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationX > 0) {
        translateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (e.translationX > 100) {
        translateX.value = 400;
        runOnJS(setOpenCartSlider)(false);
      } else {
        translateX.value = 0;
      }
    });

  if (!openCartSlider) return null;

  return (
    <View className="absolute inset-0 z-50">
      {/* Backdrop */}
      <Pressable
        className="absolute inset-0 bg-black/40"
        onPress={() => setOpenCartSlider(false)}
      />

      {/* Drawer */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[animatedStyle]} className="absolute right-0 top-0 bottom-0 w-full bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <Text className="text-lg font-bold">Cart ({totalCartItems})</Text>
            <View className="flex-row items-center gap-3">
              <Pressable onPress={clearCart}>
                <Text className="text-red-500 text-sm">Clear All</Text>
              </Pressable>
              <Pressable onPress={() => setOpenCartSlider(false)}>
                <X size={24} color="#1F2937" />
              </Pressable>
            </View>
          </View>

          {/* Items */}
          <FlatList
            data={items}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View className="flex-row p-4 border-b border-gray-50">
                <Image source={{ uri: getImageUrl(item.product?.image) }} className="w-16 h-16 rounded-lg" />
                <View className="flex-1 ml-3">
                  <Text className="font-medium text-gray-900" numberOfLines={1}>{item.product?.name}</Text>
                  <Text className="text-primary font-semibold mt-1">৳{item.price}</Text>
                  <View className="flex-row items-center mt-2 gap-2">
                    <Pressable onPress={() => updateItem(item._id, { quantity: item.quantity - 1 })} className="bg-gray-100 rounded p-1">
                      <Minus size={14} />
                    </Pressable>
                    <Text className="font-medium">{item.quantity}</Text>
                    <Pressable onPress={() => updateItem(item._id, { quantity: item.quantity + 1 })} className="bg-gray-100 rounded p-1">
                      <Plus size={14} />
                    </Pressable>
                    <Pressable onPress={() => removeItem(item._id)} className="ml-auto">
                      <Trash2 size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Footer */}
          <View className="p-4 border-t border-gray-100">
            <View className="flex-row justify-between mb-3">
              <Text className="font-semibold">Total</Text>
              <Text className="font-bold text-primary">৳{cartTotal}</Text>
            </View>
            <Pressable className="bg-primary py-3 rounded-lg items-center">
              <Text className="text-white font-semibold">Checkout</Text>
            </Pressable>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

## Key Points

- Full screen width on mobile
- Gesture pan to swipe-close (right to left)
- Backdrop press to close
- Same layout: header → items → footer with total + checkout
- Spring animation: `damping: 25, stiffness: 300` (matches web)

## Verify

Open cart slider, swipe to close, backdrop closes, items render with controls.
