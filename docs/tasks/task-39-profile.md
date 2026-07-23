# Task 39 — Profile Screen

> **Phase**: 11 — User Dashboard
> **Say**: "generate task 39" or "generate task 39"

## Objective

Create the user profile screen displaying user information.

## Reference

`/ecommerce/app/(dashboard)/user/profile/page.tsx`

## File to Create

### `mobile/app/user/profile.tsx`

## Implementation

```tsx
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react-native";
import { useUserStore } from "../../store/user.store";

export default function ProfileScreen() {
  const router = useRouter();
  const user = useUserStore((s) => s.user);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">Profile</Text>
      </View>

      <View className="mx-4 mt-4 bg-white rounded-xl p-6">
        {/* Avatar */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-3">
            <Text className="text-3xl font-bold text-primary">{user?.name?.charAt(0) || "U"}</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">{user?.name || "User"}</Text>
        </View>

        {/* Info */}
        <View className="gap-4">
          <View className="flex-row items-center gap-3">
            <Mail size={18} color="#6B7280" />
            <Text className="text-gray-700">{user?.email || "Not provided"}</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Phone size={18} color="#6B7280" />
            <Text className="text-gray-700">{user?.phone || "Not provided"}</Text>
          </View>
          {user?.address && (
            <View className="flex-row items-center gap-3">
              <MapPin size={18} color="#6B7280" />
              <Text className="text-gray-700">{user.address}</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
```

## Verify

Profile displays user info correctly, back navigation works.
