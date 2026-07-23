import { useEffect } from "react";
import { View, Text, Pressable, FlatList, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { X, Trash2, Plus, Minus } from "lucide-react-native";
import { useCartStore } from "../../store/cart.store";
import useOpenCloseState from "../../store/openclose.store";
import { getImageUrl } from "../../lib/utils";
import { useRouter } from "expo-router";
import { CartItem } from "../../types/cart.types";

export default function CartSlider() {
  const router = useRouter();
  const openCartSlider = useOpenCloseState((s) => s.openCartSlider);
  const setOpenCartSlider = useOpenCloseState((s) => s.setOpenCartSlider);
  const cart = useCartStore((s) => s.cart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateItem = useCartStore((s) => s.updateItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalCartItems = useCartStore((s) => s.totalCartItems);
  const cartTotal = useCartStore((s) => s.cartTotal);

  const translateX = useSharedValue(400);

  useEffect(() => {
    translateX.value = openCartSlider ? 0 : 400;
  }, [openCartSlider]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(translateX.value, {
          damping: 25,
          stiffness: 300,
        }),
      },
    ],
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

  const handleCheckout = () => {
    setOpenCartSlider(false);
    router.push("/checkout");
  };

  if (!openCartSlider) return null;

  return (
    <View className="absolute inset-0 z-50">
      <Pressable
        className="absolute inset-0 bg-black/40"
        onPress={() => setOpenCartSlider(false)}
      />

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[animatedStyle]}
          className="absolute right-0 top-0 bottom-0 w-full bg-white"
        >
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
            data={cart}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }: { item: CartItem }) => (
              <View className="flex-row p-4 border-b border-gray-50">
                <Image
                  source={{ uri: getImageUrl(item.thumbnail) }}
                  className="w-16 h-16 rounded-lg"
                />
                <View className="flex-1 ml-3">
                  <Text className="font-medium text-gray-900" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-primary font-semibold mt-1">
                    ৳{item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price}
                  </Text>
                  <View className="flex-row items-center mt-2 gap-2">
                    <Pressable
                      onPress={() =>
                        updateItem(item.id, { quantity: item.quantity - 1 })
                      }
                      className="bg-gray-100 rounded p-1"
                    >
                      <Minus size={14} />
                    </Pressable>
                    <Text className="font-medium">{item.quantity}</Text>
                    <Pressable
                      onPress={() =>
                        updateItem(item.id, { quantity: item.quantity + 1 })
                      }
                      className="bg-gray-100 rounded p-1"
                    >
                      <Plus size={14} />
                    </Pressable>
                    <Pressable
                      onPress={() => removeItem(item.id)}
                      className="ml-auto"
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <Text className="text-gray-500">Your cart is empty</Text>
              </View>
            }
          />

          {/* Footer */}
          <View className="p-4 border-t border-gray-100">
            <View className="flex-row justify-between mb-3">
              <Text className="font-semibold">Total</Text>
              <Text className="font-bold text-primary">৳{cartTotal}</Text>
            </View>
            <Pressable
              onPress={handleCheckout}
              className="bg-primary py-3 rounded-lg items-center"
            >
              <Text className="text-white font-semibold">Checkout</Text>
            </Pressable>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
