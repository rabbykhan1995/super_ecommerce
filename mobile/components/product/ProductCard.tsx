import useOpenCloseState from "@/store/openclose.store";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { ShoppingCart, Star } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { getImageUrl } from "../../lib/utils";

interface ProductCardProps {
  product: any;
}

// Reliable SVG/PNG fallback image that will never fail over network
const DEFAULT_PLACEHOLDER = "https://placehold.co/400x400/png?text=No+Image";

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const {setVariantModalOpen, setVariantModalProduct} = useOpenCloseState();
  // 1. Safe image extraction
  const rawImage = imgError
    ? null
    : product?.thumbnail
      null;

  // 2. Get safe image object
  const imageSource = rawImage
    ? getImageUrl(rawImage)
    : { uri: DEFAULT_PLACEHOLDER };

  // 3. Discount calculation
  const price = Number(product?.salePrice || product?.price) || 0;
  const discountPrice = Number(product?.discountPrice) || 0;
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;
  
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/product/[slug]",
          params: { slug: product?.slug || String(product?.id) },
        })
      }
      className="bg-white rounded-xl p-3 mb-3 flex-1 mx-1"
    >
      <View className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden justify-center items-center">
        {hasDiscount && (
          <View className="absolute top-1 left-1 z-10 bg-primary rounded-full px-2 py-0.5">
            <Text className="text-white text-xs font-bold">
              -{discountPercent}%
            </Text>
          </View>
        )}

        {Number(product?.totalSold) > 0 && (
          <View className="absolute top-1 right-1 z-10 bg-green-500 rounded-full px-2 py-0.5">
            <Text className="text-white text-xs font-bold">
              {product.totalSold} SOLD
            </Text>
          </View>
        )}

        {/* Expo Image with full parent width/height filling */}
        <ExpoImage
          source={imageSource}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
          transition={200}
          cachePolicy="disk"
          onError={() => {
            console.log("Product image failed to load, falling back...");
            setImgError(true);
          }}
        />

        {product?.stock === 0 && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center">
            <Text className="text-white font-bold">Out of Stock</Text>
          </View>
        )}
      </View>

      <Text className="font-medium text-gray-900 mt-2" numberOfLines={1}>
        {product?.name || "Untitled Product"}
      </Text>

      <View className="flex-row items-center gap-1 mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            color={
              star <= Math.round(product?.averageRating || 0)
                ? "#F59E0B"
                : "#D1D5DB"
            }
            fill={
              star <= Math.round(product?.averageRating || 0)
                ? "#F59E0B"
                : "#D1D5DB"
            }
          />
        ))}
        <Text className="text-xs text-gray-400 ml-1">
          ({product?.totalReviews || 0})
        </Text>
      </View>

      <View className="flex-row items-center gap-2 mt-1">
        <Text className="text-green-600 font-bold">
          ৳{hasDiscount ? discountPrice : price}
        </Text>
        {hasDiscount && (
          <Text className="text-gray-400 line-through text-sm">৳{price}</Text>
        )}
      </View>

      <Pressable onPress={()=>{
        const p = product;
        setVariantModalProduct(p);
        setVariantModalOpen(true);
      }} className="bg-primary rounded-lg py-2 mt-2 items-center">
        <View className="flex-row items-center gap-1">
          <ShoppingCart size={14} color="white" />
          <Text className="text-white text-sm font-semibold">Add to Cart</Text>
        </View>
      </Pressable>
    </Pressable>
  );
}