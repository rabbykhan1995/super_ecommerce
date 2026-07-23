import { View, Text, FlatList } from "react-native";
import ProductCard from "../product/ProductCard";

interface FlashProductsSliderProps {
  products: any[];
}

export default function FlashProductsSlider({ products }: FlashProductsSliderProps) {
  if (!products || products.length === 0) return null;

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between px-4 mb-3">
        <View className="flex-row items-center gap-2">
          <View className="bg-red-500 rounded-full w-2 h-2" />
          <Text className="text-lg font-bold text-gray-900">Flash Sale</Text>
        </View>
        <Text className="text-primary text-sm font-medium">View All</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        ItemSeparatorComponent={() => <View className="w-2" />}
        renderItem={({ item }) => (
          <View className="w-[160px]">
            <ProductCard product={item} />
          </View>
        )}
      />
    </View>
  );
}
