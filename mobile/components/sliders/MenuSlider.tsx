import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import {
  X,
  Home,
  Package,
  Info,
  Phone,
  ClipboardList,
  HelpCircle,
  LogIn,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "../../store/user.store";
import useOpenCloseState from "../../store/openclose.store";
import api from "../../lib/api";

export default function MenuSlider() {
  const router = useRouter();
  const openMenuSlider = useOpenCloseState((s) => s.openMenuSlider);
  const setOpenMenuSlider = useOpenCloseState((s) => s.setOpenMenuSlider);
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const [categories, setCategories] = useState<any[]>([]);

  const translateX = useSharedValue(-320);

  useEffect(() => {
    translateX.value = openMenuSlider ? 0 : -320;
  }, [openMenuSlider]);

  useEffect(() => {
    if (openMenuSlider) {
      api
        .get("/category/list")
        .then((res) => setCategories(res.data?.data || []))
        .catch(() => {});
    }
  }, [openMenuSlider]);

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
      if (e.translationX < 0) {
        translateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (e.translationX < -100) {
        translateX.value = -320;
        runOnJS(setOpenMenuSlider)(false);
      } else {
        translateX.value = 0;
      }
    });

  const navigate = (path: string) => {
    setOpenMenuSlider(false);
    router.push(path as any);
  };

  const handleLogout = async () => {
    await logout();
    setOpenMenuSlider(false);
  };

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Package, label: "Products", path: "/products" },
    { icon: Info, label: "About", path: "/about" },
    { icon: Phone, label: "Contact", path: "/contact" },
    { icon: ClipboardList, label: "Track Order", path: "/track-order" },
    { icon: HelpCircle, label: "FAQ", path: "/faq" },
  ];

  if (!openMenuSlider) return null;

  return (
    <View className="absolute inset-0 z-50">
      <Pressable
        className="absolute inset-0 bg-black/40"
        onPress={() => setOpenMenuSlider(false)}
      />

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[animatedStyle]}
          className="absolute left-0 top-0 bottom-0 w-[80vw] bg-white"
        >
          <ScrollView className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <Text className="text-lg font-bold">Menu</Text>
              <Pressable onPress={() => setOpenMenuSlider(false)}>
                <X size={24} color="#1F2937" />
              </Pressable>
            </View>

            {/* User Section */}
            {user && (
              <View className="p-4 border-b border-gray-100 bg-gray-50">
                <Text className="font-semibold text-gray-900">{user.name}</Text>
                <Text className="text-sm text-gray-500">{user.email}</Text>
              </View>
            )}

            {/* Menu Items */}
            {menuItems.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => navigate(item.path)}
                className="flex-row items-center justify-between p-4 border-b border-gray-50"
              >
                <View className="flex-row items-center gap-3">
                  <item.icon size={20} color="#4B5563" />
                  <Text className="text-gray-700">{item.label}</Text>
                </View>
                <ChevronRight size={16} color="#9CA3AF" />
              </Pressable>
            ))}

            {/* Categories */}
            {categories.length > 0 && (
              <View className="p-4 border-t border-gray-100">
                <Text className="font-semibold text-gray-900 mb-2">
                  Categories
                </Text>
                {categories.map((cat: any) => (
                  <Pressable
                    key={cat.id}
                    onPress={() =>
                      navigate(`/products?category=${cat.id}`)
                    }
                    className="py-2"
                  >
                    <Text className="text-gray-600">{cat.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Auth Actions */}
            <View className="p-4 border-t border-gray-100">
              {user ? (
                <Pressable
                  onPress={handleLogout}
                  className="flex-row items-center gap-2"
                >
                  <LogOut size={20} color="#EF4444" />
                  <Text className="text-red-500">Logout</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => navigate("/login")}
                  className="flex-row items-center gap-2"
                >
                  <LogIn size={20} color="#F7311E" />
                  <Text className="text-primary font-semibold">Login</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
