# Task 43 — Order Detail Screen

> **Phase**: 11 — User Dashboard
> **Say**: "generate task 43" or "generate task 43"

## Objective

Create the order detail screen showing full order information.

## Reference

`/ecommerce/app/(dashboard)/user/my-orders/[orderNo]/page.tsx`

## File to Create

### `mobile/app/user/my-orders/[orderNo].tsx`

## Implementation

```tsx
import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import ExpoImage from "expo-image";
import api from "../../../lib/api";
import { getImageUrl } from "../../../lib/utils";

export default function OrderDetailScreen() {
  const { orderNo } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/order/${orderNo}`)
      .then((res) => setOrder(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderNo]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "text-green-600";
      case "cancelled": return "text-red-600";
      case "processing": return "text-yellow-600";
      default: return "text-blue-600";
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Loading order details...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Order not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">Order #{order.orderNo}</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Status */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-500">Status</Text>
            <Text className={`font-semibold capitalize ${getStatusColor(order.status)}`}>{order.status}</Text>
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-gray-500">Date</Text>
            <Text className="text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</Text>
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-gray-500">Payment</Text>
            <Text className="text-gray-900 capitalize">{order.paymentMethod}</Text>
          </View>
        </View>

        {/* Items */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="font-bold text-gray-900 mb-3">Items</Text>
          {order.items?.map((item: any, index: number) => (
            <View key={index} className={`flex-row items-center gap-3 ${index < order.items.length - 1 ? "pb-3 mb-3 border-b border-gray-50" : ""}`}>
              <ExpoImage source={{ uri: getImageUrl(item.product?.image) }} className="w-14 h-14 rounded-lg" contentFit="contain" />
              <View className="flex-1">
                <Text className="font-medium text-gray-900" numberOfLines={1}>{item.product?.name}</Text>
                <Text className="text-xs text-gray-500">Qty: {item.quantity}</Text>
              </View>
              <Text className="font-semibold text-gray-900">৳{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Shipping */}
        {order.shippingAddress && (
          <View className="bg-white rounded-xl p-4 mb-4">
            <Text className="font-bold text-gray-900 mb-2">Shipping Address</Text>
            <Text className="text-gray-600">{order.shippingAddress.name}</Text>
            <Text className="text-gray-600">{order.shippingAddress.phone}</Text>
            <Text className="text-gray-600">{order.shippingAddress.address}, {order.shippingAddress.area}</Text>
            <Text className="text-gray-600">{order.shippingAddress.city}</Text>
          </View>
        )}

        {/* Total */}
        <View className="bg-white rounded-xl p-4 mb-8">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Subtotal</Text>
            <Text className="text-gray-900">৳{order.subtotal}</Text>
          </View>
          {order.discount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-500">Discount</Text>
              <Text className="text-green-600">-৳{order.discount}</Text>
            </View>
          )}
          <View className="flex-row justify-between border-t border-gray-100 pt-2 mt-2">
            <Text className="font-bold text-lg">Total</Text>
            <Text className="font-bold text-lg text-primary">৳{order.total}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

## Verify

Order detail loads with status, items, shipping address, and total breakdown.
