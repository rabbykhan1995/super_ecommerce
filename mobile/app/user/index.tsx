import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  User,
  ShoppingBag,
  Settings,
  ShoppingCart,
  ChevronRight,
  Package,
} from "lucide-react-native";
import { useUserStore } from "../../store/user.store";
import api from "../../lib/api";

export default function UserDashboardScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    api
      .get("/order/my-orders")
      .then((res) => {
        const items = res.data?.data?.items || [];
        setOrderCount(items.length);
        setRecentOrders(items.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const menuItems: { icon: any; label: string; path: string }[] = [
    { icon: User, label: "My Profile", path: "/user/profile" },
    { icon: ShoppingBag, label: "My Orders", path: "/user/my-orders" },
    { icon: ShoppingCart, label: "My Cart", path: "/user/my-cart" },
    { icon: Settings, label: "Settings", path: "/user/settings" },
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      case "processing":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">Dashboard</Text>
      </View>

      {/* Welcome Banner */}
      <View className="mx-4 mt-4 bg-gray-900 rounded-2xl p-6">
        <Text className="text-orange-200/50 text-xs font-medium mb-1">
          Welcome back
        </Text>
        <Text className="text-xl font-bold text-white mb-1">
          Hey, {user?.name?.split(" ")[0] || "there"}
        </Text>
        <Text className="text-gray-400 text-sm">
          You have {orderCount} order{orderCount !== 1 ? "s" : ""} so far
        </Text>
      </View>

      {/* Menu Items */}
      <View className="mx-4 mt-4 bg-white rounded-xl overflow-hidden">
        {menuItems.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.path as any)}
            className={`flex-row items-center justify-between p-4 ${
              index < menuItems.length - 1 ? "border-b border-gray-50" : ""
            }`}
          >
            <View className="flex-row items-center gap-3">
              <item.icon size={20} color="#4B5563" />
              <Text className="text-gray-700">{item.label}</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </Pressable>
        ))}
      </View>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <View className="mx-4 mt-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-gray-900">Recent Orders</Text>
            <Pressable onPress={() => router.push("/user/my-orders")}>
              <Text className="text-sm text-blue-600 font-medium">View All</Text>
            </Pressable>
          </View>
          <View className="bg-white rounded-xl overflow-hidden">
            {recentOrders.map((order: any, index: number) => (
              <Pressable
                key={order.id}
                onPress={() => router.push(`/user/my-orders/${order.id}`)}
                className={`flex-row items-center justify-between p-4 ${
                  index < recentOrders.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Package size={14} color="#6B7280" />
                    <Text className="font-semibold text-gray-900">#{order.id}</Text>
                  </View>
                  <Text className="text-xs text-gray-500">
                    {order.items?.length || 0} items • ৳{order.totalAmount}
                  </Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                  <Text
                    className={`text-xs font-medium capitalize ${
                      getStatusColor(order.status).split(" ")[0]
                    }`}
                  >
                    {order.status}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
