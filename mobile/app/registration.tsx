import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import OTPInput from "../components/ui/OTPInput";
import api from "../lib/api";
import { signInWithGoogle } from "../lib/google-auth";
import { useUserStore } from "../store/user.store";
import { useCartStore } from "../store/cart.store";


export default function RegistrationScreen() {
  const router = useRouter();
  const fetchUser = useUserStore((s) => s.fetchUser);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!name.trim()) {
      Toast.show({ type: "error", text1: "Name is required" });
      return;
    }
    if (!email.trim()) {
      Toast.show({ type: "error", text1: "Email is required" });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/send-email-verify-otp", { email });
      setOtpSent(true);
      Toast.show({ type: "success", text1: "OTP sent to your email" });
    } catch (err: any) {
      const msg = err.response?.data?.msg || "Failed to send OTP";
      Toast.show({ type: "error", text1: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!otp || otp.length !== 6) {
      Toast.show({ type: "error", text1: "Please enter the 6-digit OTP" });
      return;
    }
    if (!phone.trim()) {
      Toast.show({ type: "error", text1: "Phone number is required" });
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

    setLoading(true);
    try {
      await api.post("/auth/register-manually", {
        name,
        email,
        mobile: phone,
        password,
        otp,
      });

      Toast.show({ type: "success", text1: "Registration successful", text2: "Please login" });
      router.replace("/login");
    } catch (err: any) {
      const msg = err.response?.data?.msg || "Registration failed";
      Toast.show({ type: "error", text1: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      await fetchUser();
      await fetchCart();
      Toast.show({ type: "success", text1: "Account created successfully" });
      router.replace("/");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Google sign up failed",
        text2: err.message || "Please try again",
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

          <Text className="text-2xl font-bold text-gray-900 mb-1">Create Account</Text>
          <Text className="text-gray-500 mb-8">Sign up to get started</Text>

          <Input label="Full Name" value={name} onChangeText={setName} placeholder="John Doe" />
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />

          {!otpSent ? (
            <Button title="Send Verification OTP" onPress={handleSendOTP} loading={loading} className="mt-2" />
          ) : (
            <>
              <View className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
                <Text className="text-blue-700 text-sm text-center">
                  A 6-digit code was sent to <Text className="font-semibold">{email}</Text>
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">Enter OTP</Text>
                <OTPInput value={otp} onChange={setOtp} validTime={120} />
              </View>

              <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="+880 1XXXXXXXXX" keyboardType="phone-pad" />
              <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

              <Button title="Register" onPress={handleRegister} loading={loading} className="mt-2" />
            </>
          )}

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-400 text-sm">Or continue with</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          <Pressable
            onPress={handleGoogleSignUp}
            disabled={googleLoading}
            className="flex-row items-center justify-center border border-gray-300 rounded-lg py-3 px-6"
          >
            {googleLoading ? (
              <Text className="text-gray-500">Signing up...</Text>
            ) : (
              <>
                <Text className="text-lg mr-2">G</Text>
                <Text className="text-gray-700 font-medium">Sign up with Google</Text>
              </>
            )}
          </Pressable>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Already have an account? </Text>
            <Pressable onPress={() => router.push("/login")}>
              <Text className="text-primary font-semibold">Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
