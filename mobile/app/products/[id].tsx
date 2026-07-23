import { useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Heart, Share2, Star } from "lucide-react-native";
import ProductImageGallery from "../../components/product/ProductImageGallery";
import VariantModal from "../../components/ui/VariantModal";
import Button from "../../components/ui/Button";
import { useCartStore } from "../../store/cart.store";
import api from "../../lib/api";
import Toast from "react-native-toast-message";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVariantModal, setShowVariantModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, variantRes] = await Promise.all([
          api.get(`/product/productBySlug/${id}`),
          api.get(`/product/ecom-variants/${id}`),
        ]);
        setProduct(productRes.data?.data);
        setVariants(variantRes.data?.data || []);
      } catch (err) {
        // Error handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (variants.length > 0) {
      setShowVariantModal(true);
      return;
    }
    try {
      await addItem({ productID: product._id, variantID: 0, quantity: 1 });
      Toast.show({ type: "success", text1: "Added to cart" });
    } catch (err) {
      // Error handled by store
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Product not found</Text>
      </SafeAreaView>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </Pressable>
        <Text className="font-semibold text-gray-900 flex-1 text-center" numberOfLines={1}>{product.name}</Text>
        <View className="flex-row gap-3">
          <Pressable><Share2 size={20} color="#4B5563" /></Pressable>
          <Pressable><Heart size={20} color="#4B5563" /></Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ProductImageGallery images={product.images || [product.image]} />

        <View className="p-4">
          <Text className="text-xl font-bold text-gray-900 mb-1">{product.name}</Text>

          <View className="flex-row items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={16} color={star <= (product.rating || 0) ? "#F59E0B" : "#D1D5DB"} fill={star <= (product.rating || 0) ? "#F59E0B" : "#D1D5DB"} />
            ))}
            <Text className="text-sm text-gray-500 ml-1">({product.reviewCount || 0} reviews)</Text>
          </View>

          <View className="flex-row items-center gap-3 mb-4">
            <Text className="text-2xl font-bold text-primary">
              ৳{hasDiscount ? product.discountPrice : product.price}
            </Text>
            {hasDiscount && (
              <Text className="text-gray-400 line-through text-lg">৳{product.price}</Text>
            )}
            {hasDiscount && (
              <View className="bg-red-100 px-2 py-1 rounded">
                <Text className="text-primary text-xs font-bold">
                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                </Text>
              </View>
            )}
          </View>

          {product.description && (
            <View className="mb-6">
              <Text className="font-semibold text-gray-900 mb-2">Description</Text>
              <Text className="text-gray-600 leading-6">{product.description}</Text>
            </View>
          )}

          <View className="flex-row items-center gap-2 mb-6">
            <View className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
            <Text className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
              {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="flex-row items-center gap-3 p-4 border-t border-gray-100 bg-white">
        <Button title="Add to Cart" onPress={handleAddToCart} className="flex-1" />
      </View>

      <VariantModal
        visible={showVariantModal}
        product={product}
        variants={variants}
        onClose={() => setShowVariantModal(false)}
      />
    </SafeAreaView>
  );
}
