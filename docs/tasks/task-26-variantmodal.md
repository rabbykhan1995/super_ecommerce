# Task 26 — VariantModal

> **Phase**: 7 — Product Components
> **Say**: "generate task 26" or "generate task 26"

## Objective

Create a modal/bottom sheet for selecting product variants (size, color, etc.) before adding to cart.

## Reference

`/ecommerce/components/Modals/VariantModal.tsx`

## File to Create

### `mobile/components/ui/VariantModal.tsx`

## Implementation

```tsx
import { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { X, Minus, Plus } from "lucide-react-native";
import Button from "./Button";
import { useCartStore } from "../../store/cart.store";

interface VariantModalProps {
  visible: boolean;
  product: any;
  variants: any[];
  onClose: () => void;
}

export default function VariantModal({ visible, product, variants, onClose }: VariantModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariant, setSelectedVariant] = useState<any>(variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addItem({
        product: product._id,
        variant: selectedVariant?._id,
        quantity,
        price: selectedVariant?.price || product.price,
      });
      onClose();
    } catch (err) {
      // Error handled by store
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-2xl p-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold">Select Variant</Text>
            <Pressable onPress={onClose}>
              <X size={22} color="#1F2937" />
            </Pressable>
          </View>

          {/* Variant Options */}
          <View className="flex-row flex-wrap gap-2 mb-6">
            {variants.map((variant) => (
              <Pressable
                key={variant._id}
                onPress={() => setSelectedVariant(variant)}
                className={`px-4 py-2 rounded-lg border ${selectedVariant?._id === variant._id ? "bg-primary border-primary" : "border-gray-300"}`}
              >
                <Text className={selectedVariant?._id === variant._id ? "text-white" : "text-gray-700"}>
                  {variant.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Quantity */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="font-medium text-gray-700">Quantity</Text>
            <View className="flex-row items-center gap-4">
              <Pressable onPress={() => setQuantity(Math.max(1, quantity - 1))} className="bg-gray-100 rounded-lg p-2">
                <Minus size={18} />
              </Pressable>
              <Text className="font-semibold text-lg">{quantity}</Text>
              <Pressable onPress={() => setQuantity(quantity + 1)} className="bg-gray-100 rounded-lg p-2">
                <Plus size={18} />
              </Pressable>
            </View>
          </View>

          {/* Price */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-500">Price</Text>
            <Text className="text-primary font-bold text-lg">
              ৳{selectedVariant?.price || product?.price}
            </Text>
          </View>

          {/* Add to Cart */}
          <Button title="Add to Cart" onPress={handleAddToCart} loading={loading} />
        </View>
      </View>
    </Modal>
  );
}
```

## Key Points

- React Native `Modal` with slide animation
- Variant selection chips
- Quantity controls (+/-)
- Price updates based on selected variant
- Add to cart via store

## Verify

Modal opens, variant selection works, quantity adjusts, add to cart succeeds.
