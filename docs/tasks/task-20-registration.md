# Task 20 — Registration Screen

> **Phase**: 6 — Auth Screens
> **Say**: "generate task 20" or "generate task 20"

## Objective

Create the registration screen with name, email, phone, password fields.

## Reference

`/ecommerce/app/(with_footer)/registration/page.tsx`

## File to Create

### `mobile/app/registration.tsx`

## Design

```
┌────────────────────────────────┐
│         ← Back                 │
│                                │
│      Create Account            │
│      Sign up to get started    │
│                                │
│  ┌──────────────────────────┐  │
│  │ Full Name                │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ Email                    │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ Phone                    │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ Password                 │  │
│  └──────────────────────────┘  │
│                                │
│  [  Register  ]                │
│                                │
│  Already have an account?      │
│  Login                         │
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

export default function RegistrationScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Toast.show({ type: "error", text1: "Please fill all fields" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, phone, password });
      Toast.show({ type: "success", text1: "Registration successful", text2: "Please login" });
      router.replace("/login");
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

          <Text className="text-2xl font-bold text-gray-900 mb-1">Create Account</Text>
          <Text className="text-gray-500 mb-8">Sign up to get started</Text>

          <Input label="Full Name" value={name} onChangeText={setName} placeholder="John Doe" />
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
          <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="+880 1XXXXXXXXX" keyboardType="phone-pad" />
          <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

          <Button title="Register" onPress={handleRegister} loading={loading} className="mt-2" />

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
```

## Verify

Register with valid data → success toast → redirect to login.
Register with existing email → error toast.
