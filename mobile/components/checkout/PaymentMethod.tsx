import { View, Text, Pressable } from "react-native";
import { CreditCard, Banknote } from "lucide-react-native";

interface PaymentMethodProps {
  selected: string;
  onSelect: (method: string) => void;
}

export default function PaymentMethod({ selected, onSelect }: PaymentMethodProps) {
  return (
    <View>
      <Text className="text-lg font-bold mb-4">Payment Method</Text>
      <Pressable
        onPress={() => onSelect("stripe")}
        className={`flex-row items-center gap-3 p-4 rounded-xl border ${selected === "stripe" ? "border-primary bg-primary/5" : "border-gray-200"}`}
      >
        <CreditCard size={22} color={selected === "stripe" ? "#F7311E" : "#6B7280"} />
        <View className="flex-1">
          <Text className="font-medium text-gray-900">Stripe</Text>
          <Text className="text-xs text-gray-500">Pay with card</Text>
        </View>
        <View className={`w-5 h-5 rounded-full border-2 ${selected === "stripe" ? "border-primary" : "border-gray-300"} items-center justify-center`}>
          {selected === "stripe" && <View className="w-3 h-3 rounded-full bg-primary" />}
        </View>
      </Pressable>

      <Pressable
        onPress={() => onSelect("cod")}
        className={`flex-row items-center gap-3 p-4 rounded-xl border mt-3 ${selected === "cod" ? "border-primary bg-primary/5" : "border-gray-200"}`}
      >
        <Banknote size={22} color={selected === "cod" ? "#F7311E" : "#6B7280"} />
        <View className="flex-1">
          <Text className="font-medium text-gray-900">Cash on Delivery</Text>
          <Text className="text-xs text-gray-500">Pay when you receive</Text>
        </View>
        <View className={`w-5 h-5 rounded-full border-2 ${selected === "cod" ? "border-primary" : "border-gray-300"} items-center justify-center`}>
          {selected === "cod" && <View className="w-3 h-3 rounded-full bg-primary" />}
        </View>
      </Pressable>
    </View>
  );
}
