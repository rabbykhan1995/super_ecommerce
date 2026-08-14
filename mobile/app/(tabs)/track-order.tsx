import api from "@/lib/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TrackOrderScreen() {
  const params = useLocalSearchParams<{ orderId?: string }>();
  const router = useRouter();
  const [orderId, setOrderId] = useState(params.orderId || "");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (id?: string) => {
    const searchId = id || orderId.trim();
    if (!searchId) {
      Alert.alert("Error", "Please enter an order ID");
      return;
    }
    const numericId = Number(searchId);
    if (!numericId || isNaN(numericId)) {
      Alert.alert("Error", "Invalid order ID");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/order/track-order/${numericId}`);

      if (res.data?.success) {
        router.push(`/user/public-order/${numericId}`);
      }
    } catch {
      Alert.alert("Not Found", "No order found with this ID");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.orderId) {
      setOrderId(params.orderId);
      handleTrack(params.orderId);
    }
  }, [params.orderId]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top","bottom"]}>
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
        onPress={() => handleTrack()}
        disabled={loading}
        className={`py-3 rounded-xl items-center ${loading ? "bg-gray-400" : "bg-blue-600"}`}
      >
        <Text className="text-white font-semibold">
          {loading ? "Searching..." : "Track"}
        </Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}
