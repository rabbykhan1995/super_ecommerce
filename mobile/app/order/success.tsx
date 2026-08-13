import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle, Package, Truck } from "lucide-react-native";
import Button from "../../components/ui/Button";
import api from "../../lib/api";

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    api
      .get(`/order/order/${orderId}`)
      .then((res) => setOrder(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
      <View className="items-center">
        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
          <CheckCircle size={40} color="#22C55E" />
        </View>

        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Order Placed Successfully!
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          Thank you for your order. We'll process it right away.
        </Text>

        {loading ? (
          <Text className="text-gray-400 mb-6">Loading order details...</Text>
        ) : order ? (
          <View className="w-full bg-gray-50 rounded-xl p-4 mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-gray-500">Order No</Text>
              <Text className="text-sm font-bold text-gray-900">#{order.id}</Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-gray-500">Status</Text>
              <Text className="text-sm font-semibold text-blue-600 capitalize">
                {order.status}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-gray-500">Payment</Text>
              <Text className="text-sm font-semibold capitalize">
                {order.paymentMethod === "stripe" ? "Paid (Stripe)" : "Cash on Delivery"}
              </Text>
            </View>
            {order.totalAmount > 0 && (
              <View className="flex-row items-center justify-between border-t border-gray-200 pt-2 mt-2">
                <Text className="text-sm text-gray-500">Total</Text>
                <Text className="text-lg font-bold text-gray-900">
                  ৳{order.totalAmount}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        <View className="w-full gap-3">
          {orderId && (
            <Button
              title="View Order Details"
              onPress={() => router.replace(`/user/my-orders/${orderId}`)}
            />
          )}
          <Button
            title="Track Order"
            onPress={() => router.push("/track-order")}
            variant="outline"
          />
          <Button
            title="Continue Shopping"
            onPress={() => router.replace("/")}
            variant="outline"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
