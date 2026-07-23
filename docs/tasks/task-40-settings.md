# Task 40 — Settings Screen

> **Phase**: 11 — User Dashboard
> **Say**: "generate task 40" or "generate task 40"

## Objective

Create the settings screen with account options.

## Reference

`/ecommerce/app/(dashboard)/user/settings/page.tsx`

## File to Create

### `mobile/app/user/settings.tsx`

## Implementation

```tsx
import { View, Text, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Bell, Moon, Shield, LogOut, ChevronRight } from "lucide-react-native";
import { useUserStore } from "../../store/user.store";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useUserStore();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => { logout(); router.replace("/login"); } },
    ]);
  };

  const settings = [
    { icon: Bell, label: "Notifications", action: () => {} },
    { icon: Moon, label: "Appearance", action: () => {} },
    { icon: Shield, label: "Privacy", action: () => {} },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900">Settings</Text>
      </View>

      <View className="mx-4 mt-4 bg-white rounded-xl overflow-hidden">
        {settings.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={item.action}
            className={`flex-row items-center justify-between p-4 ${index < settings.length - 1 ? "border-b border-gray-50" : ""}`}
          >
            <View className="flex-row items-center gap-3">
              <item.icon size={20} color="#4B5563" />
              <Text className="text-gray-700">{item.label}</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </Pressable>
        ))}
      </View>

      <Pressable onPress={handleLogout} className="mx-4 mt-4 bg-white rounded-xl p-4 flex-row items-center gap-3">
        <LogOut size={20} color="#EF4444" />
        <Text className="text-red-500 font-medium">Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
}
```

## Verify

Settings options display, logout shows confirmation dialog, logout navigates to login.
