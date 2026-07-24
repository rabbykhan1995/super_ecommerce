import { Tabs } from "expo-router";
import { Home, Menu, Search, ShoppingCart } from "lucide-react-native";
import { useCartStore } from "../../store/cart.store";
import useOpenCloseState from "../../store/openclose.store";
import { useUserStore } from "../../store/user.store";

export default function TabLayout() {
  const totalCartItems = useCartStore((s) => s.totalCartItems);
  const user = useUserStore((s) => s.user);
  const setOpenMenuSlider = useOpenCloseState((s) => s.setOpenMenuSlider);
  const setOpenCartSlider = useOpenCloseState((s) => s.setOpenCartSlider);
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
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      {/* <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
          tabBarBadge: totalCartItems || undefined,
        }}
      /> */}

      {/* CART TAB: Opens CartSlider without navigating */}
      <Tabs.Screen
        name="cart"
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // Prevents tab screen navigation
            setOpenCartSlider(true); // Opens the cart slider
          },
        }}
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => <ShoppingCart size={size} color={color} />,
          tabBarBadge: totalCartItems || undefined,
        }}
      />
      {/* <Tabs.Screen
        name="user"
        options={{
          title: user ? "Profile" : "Login",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      /> */}
      <Tabs.Screen
        name="products"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="track-order"
        options={{
          href: null,
        }}
      />
{/* Menu Tab that triggers slider without opening a screen */}
      <Tabs.Screen
        name="menu"
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // Stop navigation
            setOpenMenuSlider(true); // Open slider
          },
        }}
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => <Menu size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
