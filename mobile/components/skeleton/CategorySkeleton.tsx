import { View } from "react-native";

export default function CategorySkeleton() {
  return (
    <View className="flex-row gap-2 px-4 mb-4">
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="h-10 w-20 bg-gray-200 rounded-full" />
      ))}
    </View>
  );
}
