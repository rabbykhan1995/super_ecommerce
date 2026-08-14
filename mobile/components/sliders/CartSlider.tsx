import { useRouter } from "expo-router";
import { Minus, Plus, Trash2, X } from "lucide-react-native";
import { useEffect } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getImageUrl } from "../../lib/utils";
import { useCartStore } from "../../store/cart.store";
import useOpenCloseState from "../../store/openclose.store";
import { CartItem } from "../../types/cart.types";

export default function CartSlider() {
  const router = useRouter();

  const insets = useSafeAreaInsets();

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
    if (openCartSlider) {
      translateX.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.quad),
      });
    } else {
      translateX.value = withTiming(400, {
        duration: 200,
        easing: Easing.in(Easing.quad),
      });
    }
  }, [openCartSlider]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationX > 0) {
        translateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (e.translationX > 100) {
        translateX.value = withTiming(400, { duration: 200 }, () => {
          runOnJS(setOpenCartSlider)(false);
        });
      } else {
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  const handleCheckout = () => {
    setOpenCartSlider(false);
    router.push("/checkout");
  };

  if (!openCartSlider) return null;

  return (
    <View className="absolute inset-0 z-50">
      {/* Overlay */}
      <Pressable
        className="absolute inset-0 bg-black/40"
        onPress={() => setOpenCartSlider(false)}
      />

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            animatedStyle,
            {
              top: insets.top,
              bottom: insets.bottom,
            },
          ]}
          className="absolute right-0 w-full bg-white"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <Text className="text-lg font-bold">
              Cart ({totalCartItems})
            </Text>

            <View className="flex-row items-center gap-3">
              <Pressable onPress={clearCart}>
                <Text className="text-red-500 text-sm">
                  Clear All
                </Text>
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
                  source={getImageUrl(item.thumbnail)}
                  className="w-16 h-16 rounded-lg"
                />

                <View className="flex-1 ml-3">
                  <Text
                    className="font-medium text-gray-900"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>

                  <Text className="text-primary font-semibold mt-1">
                    ৳
                    {item.discountPrice && item.discountPrice > 0
                      ? item.discountPrice
                      : item.price}
                  </Text>

                  <View className="flex-row items-center mt-2 gap-2">
                    <Pressable
                      onPress={() =>
                        updateItem(item.id, {
                          quantity: item.quantity - 1,
                        })
                      }
                      className="bg-gray-100 rounded p-1"
                    >
                      <Minus size={14} />
                    </Pressable>

                    <Text className="font-medium">
                      {item.quantity}
                    </Text>

                    <Pressable
                      onPress={() =>
                        updateItem(item.id, {
                          quantity: item.quantity + 1,
                        })
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
              <View className="items-center justify-center py-20">
                <Text className="text-gray-500">
                  Your cart is empty
                </Text>
              </View>
            }
          />

          {/* Footer */}
          <View className="p-4 border-t border-gray-100">
            <View className="flex-row justify-between mb-3">
              <Text className="font-semibold">Total</Text>

              <Text className="font-bold text-primary">
                ৳{cartTotal}
              </Text>
            </View>

            <Pressable
              onPress={handleCheckout}
              className="bg-primary py-3 rounded-lg items-center"
            >
              <Text className="text-white font-semibold">
                Checkout
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}