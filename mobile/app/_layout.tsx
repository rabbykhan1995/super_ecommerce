import VariantModal from "@/components/Modals/VariantModal";
import { registerForPushNotificationsAsync } from "@/lib/notifications";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import CartSlider from "../components/sliders/CartSlider";
import MenuSlider from "../components/sliders/MenuSlider";
import "../global.css";
import AuthHelper from "../lib/auth";
import { useCartStore } from "../store/cart.store";
import { useUserStore } from "../store/user.store";

export default function RootLayout() {
  const fetchUser = useUserStore((s) => s.fetchUser);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    const initAuth = async () => {
      const token = await AuthHelper.getToken();
      if (token) {
        try {
          await Promise.all([fetchUser(), fetchCart()]);
          await registerForPushNotificationsAsync();
        } catch {
          // Token invalid — handled by interceptor
        }
      }
    };
    initAuth();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
         <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
        <Stack screenOptions={{ headerShown: false }} />
        <MenuSlider />
        <CartSlider />
        <Toast />
        <VariantModal />
        <StatusBar style="auto" />
            </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
