import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import Button from "../../components/ui/Button";

export default function OrderSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
      <View className="items-center">
        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
          <CheckCircle size={40} color="#22C55E" />
        </View>

        <Text className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</Text>
        <Text className="text-gray-500 text-center mb-2">
          Your order has been placed successfully.
        </Text>
        <Text className="text-gray-500 text-center mb-8">
          You will receive a confirmation shortly.
        </Text>

        <View className="w-full gap-3">
          <Button title="Track Order" onPress={() => router.push("/track-order")} />
          <Button title="Continue Shopping" onPress={() => router.push("/")} variant="outline" />
        </View>
      </View>
    </SafeAreaView>
  );
}
