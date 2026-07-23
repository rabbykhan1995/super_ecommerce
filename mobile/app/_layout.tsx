import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { useUserStore } from "../store/user.store";
import AuthHelper from "../lib/auth";
import MenuSlider from "../components/sliders/MenuSlider";
import CartSlider from "../components/sliders/CartSlider";

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
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
