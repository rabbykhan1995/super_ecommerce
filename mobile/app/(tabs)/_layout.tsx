import { Tabs } from "expo-router";
import { ShoppingCart, Home, Package, ClipboardList, User } from "lucide-react-native";
import { useCartStore } from "../../store/cart.store";
import { useUserStore } from "../../store/user.store";

export default function TabLayout() {
  const totalCartItems = useCartStore((s) => s.totalCartItems);
  const user = useUserStore((s) => s.user);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#F7311E",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
          tabBarBadge: totalCartItems || undefined,
        }}
      />
      <Tabs.Screen
        name="track-order"
        options={{
          title: "Track",
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: user ? "Profile" : "Login",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
