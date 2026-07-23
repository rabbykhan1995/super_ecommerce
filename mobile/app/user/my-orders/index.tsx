import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronRight, Package } from "lucide-react-native";
import api from "../../../lib/api";

export default function MyOrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/order/my-orders")
      .then((res) => setOrders(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "text-green-600 bg-green-50";
      case "cancelled": return "text-red-600 bg-red-50";
      case "processing": return "text-yellow-600 bg-yellow-50";
      default: return "text-blue-600 bg-blue-50";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">My Orders</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Package size={48} color="#D1D5DB" />
          <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">No orders yet</Text>
          <Text className="text-gray-500">Start shopping to see your orders here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item: any) => item._id}
          contentContainerClassName="p-4"
          renderItem={({ item }: any) => (
            <Pressable
              onPress={() => router.push(`/user/my-orders/${item.orderNo}`)}
              className="bg-white rounded-xl p-4 mb-3"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-semibold text-gray-900">#{item.orderNo}</Text>
                <View className={`px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                  <Text className={`text-xs font-medium capitalize ${getStatusColor(item.status).split(" ")[0]}`}>{item.status}</Text>
                </View>
              </View>
              <Text className="text-sm text-gray-500 mb-1">{item.items?.length || 0} items</Text>
              <View className="flex-row items-center justify-between">
                <Text className="font-bold text-primary">৳{item.total}</Text>
                <ChevronRight size={18} color="#9CA3AF" />
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
