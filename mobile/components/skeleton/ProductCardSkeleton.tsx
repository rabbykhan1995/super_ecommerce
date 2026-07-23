import { View } from "react-native";

export default function ProductCardSkeleton() {
  return (
    <View className="bg-white rounded-xl p-3 mb-3">
      <View className="w-full aspect-square bg-gray-200 rounded-lg mb-2" />
      <View className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <View className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
      <View className="flex-row justify-between items-center">
        <View className="h-5 bg-gray-200 rounded w-1/3" />
        <View className="h-8 bg-gray-200 rounded w-8" />
      </View>
    </View>
  );
}
