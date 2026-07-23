import { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Mail } from "lucide-react-native";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Toast from "react-native-toast-message";
import api from "../lib/api";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Toast.show({ type: "error", text1: "Please enter your email" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      Toast.show({ type: "success", text1: "Reset link sent", text2: "Check your email" });
    } catch (err: any) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow p-6" keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} className="mb-6">
            <ArrowLeft size={24} color="#1F2937" />
          </Pressable>

          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
              <Mail size={28} color="#F7311E" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</Text>
            <Text className="text-gray-500 text-center">Enter your email and we&apos;ll send you a reset link</Text>
          </View>

          {sent ? (
            <View className="items-center">
              <Text className="text-gray-600 text-center mb-6">
                We&apos;ve sent a password reset link to your email address. Please check your inbox.
              </Text>
              <Button title="Back to Login" onPress={() => router.replace("/login")} />
            </View>
          ) : (
            <>
              <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
              <Button title="Send Reset Link" onPress={handleReset} loading={loading} className="mt-2" />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
