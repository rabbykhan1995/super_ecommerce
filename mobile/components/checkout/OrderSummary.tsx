import { View, Text } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { getImageUrl } from "../../lib/utils";

interface OrderSummaryProps {
  items: any[];
  total: number;
}

export default function OrderSummary({ items, total }: OrderSummaryProps) {
  return (
    <View>
      <Text className="text-lg font-bold mb-4">Order Summary</Text>
      {items.map((item) => (
        <View key={item.id} className="flex-row items-center gap-3 mb-3 pb-3 border-b border-gray-50">
          <ExpoImage source={{ uri: getImageUrl(item.thumbnail) }} className="w-12 h-12 rounded" contentFit="contain" />
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>{item.name}</Text>
            <Text className="text-xs text-gray-500">Qty: {item.quantity}</Text>
          </View>
          <Text className="font-semibold text-gray-900">৳{item.price * item.quantity}</Text>
        </View>
      ))}
      <View className="flex-row justify-between mt-2">
        <Text className="text-lg font-bold">Total</Text>
        <Text className="text-lg font-bold text-primary">৳{total}</Text>
      </View>
    </View>
  );
}
