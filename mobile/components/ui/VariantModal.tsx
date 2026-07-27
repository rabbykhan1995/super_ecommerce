import { useState } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { X, Minus, Plus, Check } from "lucide-react-native";
import Button from "./Button";
import { useCartStore } from "../../store/cart.store";
import type { EcomVariantDetail, FullProduct } from "../../types/product.types";

interface VariantModalProps {
  visible: boolean;
  product: FullProduct;
  variants: EcomVariantDetail[];
  onClose: () => void;
}

export default function VariantModal({ visible, product, variants, onClose }: VariantModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariant, setSelectedVariant] = useState<EcomVariantDetail | null>(variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setLoading(true);
    try {
      const success = await addItem({
        productID: product.id,
        variantID: selectedVariant.id,
        quantity,
      });
      if (success) {
        onClose();
        setSelectedVariant(null);
        setQuantity(1);
      }
    } catch {
      // Error handled by store
    } finally {
      setLoading(false);
    }
  };

  const formatAttributes = (attrs: { name: string; value: string }[]) => {
    return attrs.map((a) => `${a.name}: ${a.value}`).join(", ");
  };

  const getDisplayPrice = (variant: EcomVariantDetail) => {
    if (variant.discountPrice && variant.discountPrice > 0 && variant.discountPrice < variant.salePrice) {
      return variant.discountPrice;
    }
    return variant.salePrice;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-2xl p-6 max-h-[80vh]">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold">Select Variant</Text>
            <Pressable onPress={onClose}>
              <X size={22} color="#1F2937" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
            <View className="gap-2">
              {variants.map((variant) => {
                const outOfStock = variant.stock !== null && variant.stock <= 0;
                const isSelected = selectedVariant?.id === variant.id;
                const displayPrice = getDisplayPrice(variant);
                const hasDiscount = variant.discountPrice && variant.discountPrice > 0 && variant.discountPrice < variant.salePrice;

                return (
                  <Pressable
                    key={variant.id}
                    disabled={outOfStock}
                    onPress={() => setSelectedVariant(variant)}
                    className={`p-3 rounded-xl border-2 flex-row items-center justify-between ${
                      outOfStock
                        ? "border-gray-100 bg-gray-50 opacity-50"
                        : isSelected
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200"
                    }`}
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {formatAttributes(variant.attributes)}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <Text className="text-sm font-bold text-gray-900">
                          ৳{displayPrice}
                        </Text>
                        {hasDiscount && (
                          <Text className="text-xs text-gray-400 line-through">
                            ৳{variant.salePrice}
                          </Text>
                        )}
                        <Text className={`text-xs ${outOfStock ? "text-red-500" : "text-gray-500"}`}>
                          {outOfStock ? "Out of stock" : `${variant.stock} in stock`}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View className="w-6 h-6 bg-gray-900 rounded-full items-center justify-center ml-2">
                        <Check size={14} color="white" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View className="flex-row items-center justify-between mb-4">
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

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-500">Total</Text>
            <Text className="text-primary font-bold text-lg">
              ৳{selectedVariant ? getDisplayPrice(selectedVariant) * quantity : product.salePrice}
            </Text>
          </View>

          <Button
            title={selectedVariant ? "Add to Cart" : "Select a variant"}
            onPress={handleAddToCart}
            loading={loading}
            disabled={!selectedVariant}
          />
        </View>
      </View>
    </Modal>
  );
}
