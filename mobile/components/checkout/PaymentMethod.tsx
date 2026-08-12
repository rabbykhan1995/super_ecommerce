import { View, Text, Pressable } from "react-native";
import { CreditCard } from "lucide-react-native";

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
    </View>
  );
}
