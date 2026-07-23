import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, User, ShoppingBag, Settings, ShoppingCart, ChevronRight } from "lucide-react-native";
import { useUserStore } from "../../store/user.store";

export default function UserDashboardScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  const menuItems: { icon: any; label: string; path: string }[] = [
    { icon: User, label: "My Profile", path: "/user/profile" },
    { icon: ShoppingBag, label: "My Orders", path: "/user/my-orders" },
    { icon: ShoppingCart, label: "My Cart", path: "/user/my-cart" },
    { icon: Settings, label: "Settings", path: "/user/settings" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">Dashboard</Text>
      </View>

      <View className="mx-4 mt-4 bg-white rounded-xl p-6 items-center">
        <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-3">
          <Text className="text-2xl font-bold text-primary">{user?.name?.charAt(0) || "U"}</Text>
        </View>
        <Text className="text-lg font-bold text-gray-900">{user?.name || "User"}</Text>
        <Text className="text-sm text-gray-500">{user?.email || ""}</Text>
      </View>

      <View className="mx-4 mt-4 bg-white rounded-xl overflow-hidden">
        {menuItems.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.path as any)}
            className={`flex-row items-center justify-between p-4 ${index < menuItems.length - 1 ? "border-b border-gray-50" : ""}`}
          >
            <View className="flex-row items-center gap-3">
              <item.icon size={20} color="#4B5563" />
              <Text className="text-gray-700">{item.label}</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
