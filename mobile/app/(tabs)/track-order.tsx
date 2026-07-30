import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import api from "@/utils/api";

export default function TrackOrderScreen() {
  const [orderId, setOrderId] = useState("");
  const router = useRouter();

  const handleTrack = async () => {
    if (!orderId.trim()) {
      Alert.alert("Error", "Please enter an order ID");
      return;
    }
    const id = Number(orderId.trim());
    if (!id || isNaN(id)) {
      Alert.alert("Error", "Invalid order ID");
      return;
    }
    try {
      const res = await api.get(`/order/order/${id}`);
      if (res.data?.success) {
        router.push(`/user/my-orders/${id}`);
      }
    } catch {
      Alert.alert("Not Found", "No order found with this ID");
    }
  };

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        Track Your Order
      </Text>
      <Text className="text-gray-500 mb-6">
        Enter your order ID to see the current status
      </Text>
      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4"
        placeholder="e.g. 1"
        value={orderId}
        onChangeText={setOrderId}
        keyboardType="numeric"
      />
      <TouchableOpacity
        onPress={handleTrack}
        className="bg-blue-600 py-3 rounded-xl items-center"
      >
        <Text className="text-white font-semibold">Track</Text>
      </TouchableOpacity>
    </View>
  );
}
