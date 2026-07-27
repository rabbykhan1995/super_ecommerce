import VariantModal from "@/components/Modals/VariantModal";
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
import { useUserStore } from "../store/user.store";

export default function RootLayout() {
  const fetchUser = useUserStore((s) => s.fetchUser);

  useEffect(() => {
    const initAuth = async () => {
      const token = await AuthHelper.getToken();
      if (token) {
        try {
          await fetchUser();
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
        <Stack screenOptions={{ headerShown: false }} />
        <MenuSlider />
        <CartSlider />
        <Toast />
        <VariantModal />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
