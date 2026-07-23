import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import AuthHelper from "../../lib/auth";

export default function UserLayout() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await AuthHelper.isAuthenticated();
      if (!isAuth) {
        router.replace("/login");
      } else {
        setChecking(false);
      }
    };
    checkAuth();
  }, []);

  if (checking) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F7311E" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
