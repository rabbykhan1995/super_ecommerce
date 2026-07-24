// components/sections/FeaturedProducts.tsx
import { Text, View } from "react-native";
import ProductCard from "../product/ProductCard";

interface FeaturedProductsProps {
  products: any[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <View className="px-3 py-4">
      <Text className="text-lg font-bold text-gray-900 mb-3 px-1">
        Featured Products
      </Text>

      {/* Grid container mapping 2 columns */}
      <View className="flex-row flex-wrap">
        {products.map((item) => {
          // Extract product directly since API returns flat array
          const productData = item?.product || item;

          return (
            <View key={productData?.id || productData?._id} className="w-1/2">
              <ProductCard product={productData} />
            </View>
          );
        })}
      </View>
    </View>
  );
}