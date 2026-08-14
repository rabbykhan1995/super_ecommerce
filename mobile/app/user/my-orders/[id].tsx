import { OrderStatus } from "@/types/order.types";
import { Image as ExpoImage } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, MapPin } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../../lib/api";
import { getImageUrl } from "../../../lib/utils";

const STATUS_FLOW: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped",
  "Delivered",
  "Returned",
  "Cancelled",
  "Hold",
];


export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/order/my-orders/${id}`)
      .then((res) => setOrder(res.data?.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [id]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600";

      case "Confirmed":
        return "text-blue-600";

      case "Packed":
        return "text-indigo-600";

      case "Shipped":
        return "text-purple-600";

      case "Delivered":
        return "text-green-600";

      case "Returned":
        return "text-orange-600";

      case "Cancelled":
        return "text-red-600";

      case "Hold":
        return "text-amber-600";

      default:
        return "text-gray-600";
    }
  };

  const isTerminal = ["cancelled", "failed"].includes(order?.status);
  const currentIndex = STATUS_FLOW.indexOf(order?.status);

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
        <Text className="text-lg font-bold text-gray-900">Order #{order.id}</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Status Card */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-500">Status</Text>
            <Text className={`font-semibold capitalize ${getStatusColor(order.status)}`}>
              {order.status}
            </Text>
          </View>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-500">Date</Text>
            <Text className="text-gray-900">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-500">Payment</Text>
            <Text className="text-gray-900 capitalize">
              {order.paymentMethod === "stripe"
                ? "Paid (Stripe)"
                : order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : order.paymentMethod || "N/A"}
            </Text>
          </View>
        </View>

        {/* Status Timeline */}
    <View className="bg-white rounded-xl p-4 mb-4">
  <Text className="font-bold text-gray-900 mb-4">
    Order Progress
  </Text>

  {isTerminal ? (
    <View
      className={`p-3 rounded-xl ${
        order.status === "Cancelled"
          ? "bg-red-50"
          : order.status === "Returned"
          ? "bg-orange-50"
          : "bg-amber-50"
      }`}
    >
      <Text
        className={`font-semibold ${
          order.status === "Cancelled"
            ? "text-red-700"
            : order.status === "Returned"
            ? "text-orange-700"
            : "text-amber-700"
        }`}
      >
        Order {order.status}
      </Text>
    </View>
  ) : (
    <View className="flex-row items-start">
      {STATUS_FLOW.slice(0, 5).map((status, idx) => {
        const isActive = idx <= currentIndex;
        const isCurrent = idx === currentIndex;

        return (
          <View key={status} className="flex-1 items-center">
            <View className="w-full flex-row items-center">
              {idx > 0 && (
                <View
                  className={`flex-1 h-[2px] ${
                    idx <= currentIndex
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              )}

              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  isCurrent
                    ? "bg-blue-600"
                    : isActive
                    ? "bg-green-500"
                    : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                >
                  {isActive && !isCurrent ? "✓" : idx + 1}
                </Text>
              </View>

              {idx < 4 && (
                <View
                  className={`flex-1 h-[2px] ${
                    idx < currentIndex
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </View>

            <Text
              className={`text-[10px] text-center mt-2 ${
                isCurrent
                  ? "text-blue-600 font-bold"
                  : isActive
                  ? "text-green-600"
                  : "text-gray-400"
              }`}
              numberOfLines={1}
            >
              {status}
            </Text>
          </View>
        );
      })}
    </View>
  )}
</View>

        {/* Items */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="font-bold text-gray-900 mb-3">Items</Text>
          {order.items?.map((item: any, index: number) => (
            <View
              key={index}
              className={`flex-row items-center gap-3 ${index < order.items.length - 1 ? "pb-3 mb-3 border-b border-gray-50" : ""
                }`}
            >
              <ExpoImage
                source={getImageUrl(item.thumbnail)}
                className="w-14 h-14 rounded-lg"
                contentFit="contain"
              />
              <View className="flex-1">
                <Text className="font-medium text-gray-900" numberOfLines={1}>
                  {item.productName}
                </Text>
                <Text className="text-xs text-gray-500">Qty: {item.quantity}</Text>
              </View>
              <Text className="font-semibold text-gray-900">৳{item.lineTotal}</Text>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Subtotal</Text>
            <Text className="text-gray-900">৳{order.subtotal}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500">Shipping</Text>
            <Text className="text-green-600 font-medium">Free</Text>
          </View>
          {order.discount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-500">Discount</Text>
              <Text className="text-green-600">-৳{order.discount}</Text>
            </View>
          )}
          <View className="flex-row justify-between border-t border-gray-100 pt-2 mt-2">
            <Text className="font-bold text-lg">Total</Text>
            <Text className="font-bold text-lg text-primary">৳{order.totalAmount}</Text>
          </View>
        </View>

        {/* Shipping Info */}
        <View className="bg-white rounded-xl p-4 mb-8">
          <Text className="font-bold text-gray-900 mb-3">Shipping To</Text>
          <View className="flex-row items-start gap-3">
            <MapPin size={18} color="#9CA3AF" className="mt-0.5" />
            <View>
              <Text className="text-sm font-semibold text-gray-900">
                {order.shippingName}
              </Text>
              <Text className="text-sm text-gray-600">{order.shippingPhone}</Text>
              <Text className="text-sm text-gray-600">{order.shippingAddress}</Text>
              {(order.shippingCity || order.shippingArea) && (
                <Text className="text-sm text-gray-600">
                  {[order.shippingArea, order.shippingCity].filter(Boolean).join(", ")}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
