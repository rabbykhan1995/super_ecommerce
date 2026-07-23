import { useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Header from "../../components/layout/Header";
import CartItem from "../../components/cart/CartItem";
import Button from "../../components/ui/Button";
import { useCartStore } from "../../store/cart.store";

export default function CartScreen() {
  const router = useRouter();
  const { cart, fetchCart, updateItem, removeItem, cartTotal, totalCartItems } = useCartStore();

  useEffect(() => { fetchCart(); }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <Header />

      <View className="flex-1">
        {cart.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-6xl mb-4">🛒</Text>
            <Text className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</Text>
            <Text className="text-gray-500 mb-6">Add some products to get started</Text>
            <Button title="Browse Products" onPress={() => router.push("/products")} />
          </View>
        ) : (
          <>
            <FlatList
              data={cart}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <CartItem
                  item={item}
                  onUpdateQuantity={(id, qty) => updateItem(id, { quantity: qty })}
                  onRemove={removeItem}
                />
              )}
            />

            <View className="bg-white p-4 border-t border-gray-100">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">Items ({totalCartItems})</Text>
                <Text className="font-semibold">৳{cartTotal}</Text>
              </View>
              <View className="flex-row justify-between mb-4">
                <Text className="text-lg font-bold">Total</Text>
                <Text className="text-lg font-bold text-primary">৳{cartTotal}</Text>
              </View>
              <Button title="Proceed to Checkout" onPress={() => router.push("/checkout")} />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
