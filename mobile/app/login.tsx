import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../lib/api";
import AuthHelper from "../lib/auth";
import { signInWithGoogle } from "../lib/google-auth";
import { useUserStore } from "../store/user.store";

export default function LoginScreen() {
  const router = useRouter();
  const fetchUser = useUserStore((s) => s.fetchUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: "error", text1: "Please fill all fields" });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      await AuthHelper.setToken(res.data.token);
      await fetchUser();
      Toast.show({ type: "success", text1: "Login successful" });
      router.replace("/");
    } catch (err: any) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

const handleGoogleLogin = async () => {
  setGoogleLoading(true);

  try {
    await signInWithGoogle();

    await fetchUser();

    Toast.show({
      type: "success",
      text1: "Login successful",
    });

    router.replace("/");
  } catch (err: any) {
    console.log("GOOGLE LOGIN ERROR:", err);
    console.log("GOOGLE LOGIN ERROR JSON:", JSON.stringify(err, null, 2));
    console.log("GOOGLE LOGIN ERROR MESSAGE:", err?.message);
    console.log("GOOGLE LOGIN ERROR CODE:", err?.code);

    Toast.show({
      type: "error",
      text1: "Google login failed",
      text2: `${err?.code || ""} ${err?.message || "Please try again"}`,
    });
  } finally {
    setGoogleLoading(false);
  }
};

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow p-6" keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} className="mb-6">
            <ArrowLeft size={24} color="#1F2937" />
          </Pressable>

          <Text className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</Text>
          <Text className="text-gray-500 mb-8">Login to your account</Text>

          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
          <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

          <Button title="Login" onPress={handleLogin} loading={loading} className="mt-2" />

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-400 text-sm">Or continue with</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          <Pressable
            onPress={handleGoogleLogin}
            disabled={googleLoading}
            className="flex-row items-center justify-center border border-gray-300 rounded-lg py-3 px-6"
          >
            {googleLoading ? (
              <Text className="text-gray-500">Signing in...</Text>
            ) : (
              <>
                <Text className="text-lg mr-2">G</Text>
                <Text className="text-gray-700 font-medium">Sign in with Google</Text>
              </>
            )}
          </Pressable>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Don&apos;t have an account? </Text>
            <Pressable onPress={() => router.push("/registration")}>
              <Text className="text-primary font-semibold">Register</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => router.push("/forget-password")} className="items-center mt-4">
            <Text className="text-primary text-sm">Forgot Password?</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
