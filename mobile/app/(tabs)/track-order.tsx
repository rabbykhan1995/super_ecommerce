import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useRouter } from "expo-router";
import api from "../../lib/api";
import Toast from "react-native-toast-message";

export default function TrackOrderTab() {
  const router = useRouter();
  const [orderNo, setOrderNo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!orderNo.trim()) {
      Toast.show({ type: "error", text1: "Please enter order number" });
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/order/${orderNo.trim()}`);
      if (res.data?.data) {
        router.push(`/user/my-orders/${orderNo.trim()}`);
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Order not found" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow p-6 justify-center" keyboardShouldPersistTaps="handled">
          <View className="items-center mb-8">
            <Text className="text-6xl mb-4">📋</Text>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Track Your Order</Text>
            <Text className="text-gray-500 text-center">Enter your order number to track the status</Text>
          </View>
          <Input label="Order Number" value={orderNo} onChangeText={setOrderNo} placeholder="e.g. ORD-12345" />
          <Button title="Track Order" onPress={handleTrack} loading={loading} className="mt-2" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
