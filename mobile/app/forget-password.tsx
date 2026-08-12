import { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Mail } from "lucide-react-native";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import OTPInput from "../components/ui/OTPInput";
import Toast from "react-native-toast-message";
import api from "../lib/api";
import AuthHelper from "../lib/auth";
import { useUserStore } from "../store/user.store";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Toast.show({ type: "error", text1: "Email is required" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/send-forget-password-otp", { email });
      setOtpSent(true);
      Toast.show({ type: "success", text1: "OTP sent to your email" });
    } catch (err: any) {
      const msg = err.response?.data?.msg || "Failed to send OTP";
      Toast.show({ type: "error", text1: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || otp.length !== 6) {
      Toast.show({ type: "error", text1: "Please enter the 6-digit OTP" });
      return;
    }
    if (!password) {
      Toast.show({ type: "error", text1: "Password is required" });
      return;
    }
    if (password.length < 8) {
      Toast.show({ type: "error", text1: "Password must be at least 8 characters" });
      return;
    }
    if (!/[A-Z]/.test(password)) {
      Toast.show({ type: "error", text1: "Password must contain an uppercase letter" });
      return;
    }
    if (!/[a-z]/.test(password)) {
      Toast.show({ type: "error", text1: "Password must contain a lowercase letter" });
      return;
    }
    if (!/[0-9]/.test(password)) {
      Toast.show({ type: "error", text1: "Password must contain a number" });
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      Toast.show({ type: "error", text1: "Password must contain a special character" });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: "error", text1: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { email, password, otp });
      await AuthHelper.setToken(res.data.token);
      setUser(res.data.data);
      Toast.show({ type: "success", text1: "Password reset successful" });
      router.replace("/");
    } catch (err: any) {
      const msg = err.response?.data?.msg || "Reset failed";
      Toast.show({ type: "error", text1: msg });
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
            <Text className="text-gray-500 text-center">Enter your email and we&apos;ll send you a verification code</Text>
          </View>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
          />

          {!otpSent ? (
            <Button title="Send OTP" onPress={handleSendOTP} loading={loading} className="mt-2" />
          ) : (
            <>
              <View className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
                <Text className="text-blue-700 text-sm text-center">
                  A 6-digit code was sent to <Text className="font-semibold">{email}</Text>
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Enter OTP</Text>
                <OTPInput value={otp} onChange={setOtp} validTime={300} />
              </View>

              <Input
                label="New Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 8 characters"
                secureTextEntry
              />
              <Text className="text-xs text-gray-400 -mt-3 mb-4">
                Uppercase, lowercase, number & special character required
              </Text>

              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                secureTextEntry
              />

              <Button title="Reset Password" onPress={handleResetPassword} loading={loading} className="mt-2" />
            </>
          )}

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Remember your password? </Text>
            <Pressable onPress={() => router.replace("/login")}>
              <Text className="text-primary font-semibold">Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
