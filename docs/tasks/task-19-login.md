# Task 19 — Login Screen

> **Phase**: 6 — Auth Screens
> **Say**: "generate task 19" or "generate task 19"

## Objective

Create the login screen with email/password fields.

## Reference

`/ecommerce/app/(with_footer)/login/page.tsx`

## File to Create

### `mobile/app/login.tsx`

## Design

```
┌────────────────────────────────┐
│         ← Back                 │
│                                │
│      Welcome Back              │
│      Login to your account     │
│                                │
│  ┌──────────────────────────┐  │
│  │ Email                    │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ Password                 │  │
│  └──────────────────────────┘  │
│                                │
│  [  Login  ]                   │
│                                │
│  Don't have an account?        │
│  Register                      │
│                                │
│  Forgot Password?              │
└────────────────────────────────┘
```

## Implementation

```tsx
import { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Toast from "react-native-toast-message";
import api from "../lib/api";
import AuthHelper from "../lib/auth";
import { useUserStore } from "../store/user.store";

export default function LoginScreen() {
  const router = useRouter();
  const fetchUser = useUserStore((s) => s.fetchUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Don't have an account? </Text>
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
```

## Key Points

- `KeyboardAvoidingView` for iOS keyboard handling
- `keyboardShouldPersistTaps="handled"` for ScrollView
- Calls `/auth/login`, stores token, fetches profile, navigates to home
- Error handled by API interceptor

## Verify

Login with valid credentials → navigates to home with user data.
Login with invalid credentials → error toast shown.
