import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ShoppingCart, Star } from "lucide-react-native";
import { Image as ExpoImage } from "expo-image";
import { getImageUrl } from "../../lib/utils";

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/products/[id]", params: { id: product._id } })}
      className="bg-white rounded-xl p-3 mb-3 flex-1 mx-1"
    >
      <View className="relative">
        {hasDiscount && (
          <View className="absolute top-1 left-1 z-10 bg-primary rounded-full px-2 py-0.5">
            <Text className="text-white text-xs font-bold">{discountPercent}% OFF</Text>
          </View>
        )}

        {product.sold > 0 && (
          <View className="absolute top-1 right-1 z-10 bg-green-500 rounded-full px-2 py-0.5">
            <Text className="text-white text-xs font-bold">{product.sold} SOLD</Text>
          </View>
        )}

        <ExpoImage
          source={{ uri: getImageUrl(product.image) }}
          className="w-full aspect-square rounded-lg"
          contentFit="contain"
          transition={300}
        />

        {product.stock === 0 && (
          <View className="absolute inset-0 bg-black/50 rounded-lg items-center justify-center">
            <Text className="text-white font-bold">Out of Stock</Text>
          </View>
        )}
      </View>

      <Text className="font-medium text-gray-900 mt-2" numberOfLines={1}>
        {product.name}
      </Text>

      <View className="flex-row items-center gap-1 mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            color={star <= (product.rating || 0) ? "#F59E0B" : "#D1D5DB"}
            fill={star <= (product.rating || 0) ? "#F59E0B" : "#D1D5DB"}
          />
        ))}
        <Text className="text-xs text-gray-400 ml-1">({product.reviewCount || 0})</Text>
      </View>

      <View className="flex-row items-center gap-2 mt-1">
        <Text className="text-green-600 font-bold">
          ৳{hasDiscount ? product.discountPrice : product.price}
        </Text>
        {hasDiscount && (
          <Text className="text-gray-400 line-through text-sm">৳{product.price}</Text>
        )}
      </View>

      <Pressable className="bg-primary rounded-lg py-2 mt-2 items-center">
        <View className="flex-row items-center gap-1">
          <ShoppingCart size={14} color="white" />
          <Text className="text-white text-sm font-semibold">Add to Cart</Text>
        </View>
      </Pressable>
    </Pressable>
  );
}
