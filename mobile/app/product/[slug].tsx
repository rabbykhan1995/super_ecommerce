import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Heart,
  Package,
  Share2,
  Shield,
  Star,
  Truck,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import ProductImageGallery from "../../components/product/ProductImageGallery";
import Button from "../../components/ui/Button";
import VariantModal from "../../components/ui/VariantModal";
import { fetchProductBySlug, fetchVariantsByProduct } from "../../lib/productApi";
import { useCartStore } from "../../store/cart.store";
import type { EcomVariantDetail, FullProduct } from "../../types/product.types";

export default function ProductSlugScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<FullProduct | null>(null);
  const [variants, setVariants] = useState<EcomVariantDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVariantModal, setShowVariantModal] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      setLoading(true);
      try {
        const productData = await fetchProductBySlug(slug);
        setProduct(productData);

        const variantData = await fetchVariantsByProduct(productData.id);
        setVariants(variantData);
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (variants.length > 0) {
      setShowVariantModal(true);
      return;
    }

    try {
      await addItem({
        productID: product.id,
        variantID: 0,
        quantity: 1,
      });
      Toast.show({ type: "success", text1: "Added to cart" });
    } catch {
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

  const totalStock = product.variants.reduce(
    (acc, v) => acc + (v.stock ?? 0),
    0,
  );

  const lowestPrice = product.variants.reduce(
    (acc, v) =>
      v.salePrice && v.salePrice < acc ? v.salePrice : acc,
    product.salePrice,
  );
  const highestPrice = product.variants.reduce(
    (acc, v) =>
      v.salePrice && v.salePrice > acc ? v.salePrice : acc,
    product.salePrice,
  );

  const priceRange =
    lowestPrice !== highestPrice
      ? `${lowestPrice} - ${highestPrice}`
      : `${product.salePrice}`;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </Pressable>
        <Text
          className="font-semibold text-gray-900 flex-1 text-center"
          numberOfLines={1}
        >
          {product.name}
        </Text>
        <View className="flex-row gap-3">
          <Pressable>
            <Share2 size={20} color="#4B5563" />
          </Pressable>
          <Pressable>
            <Heart size={20} color="#4B5563" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Breadcrumb */}
        {product.category && (
          <View className="px-4 py-2 flex-row items-center gap-2">
            <Text className="text-xs text-gray-400">
              {product.category.name}
            </Text>
            <Text className="text-xs text-gray-400">/</Text>
            <Text
              className="text-xs text-gray-900 font-medium flex-1"
              numberOfLines={1}
            >
              {product.name}
            </Text>
          </View>
        )}

        {/* Image Gallery */}
        <View className="px-4">
          <ProductImageGallery
            images={[
              ...product.variants.flatMap((v) => v.images ?? []),
              ...variants.flatMap((v) => v.images ?? []),
            ]}
            thumbnail={product.thumbnail}
          />
        </View>

        <View className="p-4">
          {/* Category & Brand */}
          <View className="flex-row items-center gap-2 mb-3">
            {product.category && (
              <View className="bg-blue-50 px-2.5 py-1 rounded-full">
                <Text className="text-xs font-medium text-blue-700">
                  {product.category.name}
                </Text>
              </View>
            )}
            {product.brand && (
              <View className="bg-gray-100 px-2.5 py-1 rounded-full">
                <Text className="text-xs font-medium text-gray-500">
                  {product.brand.name}
                </Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
            {product.name}
          </Text>

          {/* Rating */}
          <View className="flex-row items-center gap-3 mb-5">
            <View className="flex-row items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  color={
                    i < Math.round(product.averageRating)
                      ? "#F59E0B"
                      : "#D1D5DB"
                  }
                  fill={
                    i < Math.round(product.averageRating)
                      ? "#F59E0B"
                      : "#D1D5DB"
                  }
                />
              ))}
            </View>
            <Text className="text-sm text-gray-500">
              {product.averageRating?.toFixed(1)} ({product.totalReviews}{" "}
              reviews)
            </Text>
            <Text className="text-sm text-gray-400">|</Text>
            <Text className="text-sm text-gray-500">
              {product.totalSold} sold
            </Text>
          </View>

          {/* Short Description */}
          {product.shortDescription && (
            <Text className="text-gray-600 text-sm leading-relaxed mb-5 pb-5 border-b border-gray-100">
              {product.shortDescription}
            </Text>
          )}

          {/* Price Card */}
          <View className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-5">
            <Text className="text-3xl font-bold text-gray-900 mb-1">
              {priceRange} TK
            </Text>
            <Text className="text-xs text-gray-400">
              Tax included. Shipping calculated at checkout.
            </Text>
          </View>

          {/* Stock Status */}
          <View className="flex-row items-center gap-4 mb-5">
            <View
              className={`flex-row items-center gap-1.5 ${totalStock > 0 ? "text-emerald-600" : "text-red-500"}`}
            >
              <View
                className={`w-2 h-2 rounded-full ${totalStock > 0 ? "bg-emerald-500" : "bg-red-500"}`}
              />
              <Text
                className={`text-sm font-medium ${totalStock > 0 ? "text-emerald-600" : "text-red-500"}`}
              >
                {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
              </Text>
            </View>
            {product.variants.length > 1 && (
              <Text className="text-sm text-gray-400">
                {product.variants.length} variants available
              </Text>
            )}
          </View>

          {/* Add to Cart */}
          <View className="mb-6">
            <Button title="Add to Cart" onPress={handleAddToCart} />
          </View>

          {/* Trust Badges */}
          <View className="flex-row justify-between pt-2 mb-6">
            {[
              { icon: Truck, label: "Fast Delivery" },
              { icon: Shield, label: "Secure Payment" },
              { icon: Package, label: "Easy Returns" },
            ].map(({ icon: Icon, label }) => (
              <View key={label} className="items-center gap-2 flex-1">
                <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                  <Icon size={18} color="#4B5563" />
                </View>
                <Text className="text-xs text-gray-500 font-medium">
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {/* Description */}
    {product.description && (
  <View className="mb-6">
    <Text className="font-semibold text-gray-900 mb-2">
      Description
    </Text>
    <Markdown style={markdownStyles}>
      {product.description}
    </Markdown>
  </View>
)}

          {/* Product Details */}
          <View className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Product Details
            </Text>
            <View className="flex-row flex-wrap gap-4">
              {product.sku && (
                <View className="w-[48%]">
                  <Text className="text-xs text-gray-400 mb-1">SKU</Text>
                  <Text className="text-sm font-medium text-gray-700">
                    {product.sku}
                  </Text>
                </View>
              )}
              {product.unit && (
                <View className="w-[48%]">
                  <Text className="text-xs text-gray-400 mb-1">Unit</Text>
                  <Text className="text-sm font-medium text-gray-700">
                    {product.unit.name}
                  </Text>
                </View>
              )}
              <View className="w-[48%]">
                <Text className="text-xs text-gray-400 mb-1">Status</Text>
                <Text className="text-sm font-medium text-gray-700 capitalize">
                  {product.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Cart Bar */}
      <View className="flex-row items-center gap-3 p-4 border-t border-gray-100 bg-white">
        <Button
          title={
            totalStock > 0
              ? `Add to Cart - ${priceRange} TK`
              : "Out of Stock"
          }
          onPress={handleAddToCart}
        />
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


const markdownStyles = StyleSheet.create({
  // Root
  body: {
    color: "#4B5563", // gray-600
    fontSize: 14,
    lineHeight: 22,
  },

  // Headings
  heading1: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827", // gray-900
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 28,
  },
  heading2: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginTop: 14,
    marginBottom: 8,
    lineHeight: 26,
  },
  heading3: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937", // gray-800
    marginTop: 12,
    marginBottom: 6,
    lineHeight: 22,
  },
  heading4: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 10,
    marginBottom: 4,
  },

  // Paragraphs
  paragraph: {
    marginTop: 0,
    marginBottom: 10,
    lineHeight: 22,
  },

  // Emphasis
  strong: {
    fontWeight: "700",
    color: "#1F2937",
  },
  em: {
    fontStyle: "italic",
    color: "#4B5563",
  },
  s: {
    textDecorationLine: "line-through",
    color: "#9CA3AF", // gray-400
  },

  // Lists
  bullet_list: {
    marginTop: 2,
    marginBottom: 10,
  },
  ordered_list: {
    marginTop: 2,
    marginBottom: 10,
  },
  bullet_list_icon: {
    marginRight: 8,
    color: "#9CA3AF",
  },
  ordered_list_icon: {
    marginRight: 8,
    color: "#6B7280",
    fontWeight: "600",
  },
  list_item: {
    marginVertical: 3,
    flexDirection: "row",
    justifyContent: "flex-start",
  },

  // Links
  link: {
    color: "#2563EB", // blue-600
    textDecorationLine: "underline",
  },

  // Inline & block code
  code_inline: {
    backgroundColor: "#F3F4F6", // gray-100
    color: "#DB2777", // pink-600, common for inline code accents
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 13,
  },
  code_block: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },
  fence: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },

  // Blockquote
  blockquote: {
    backgroundColor: "#F9FAFB",
    borderLeftWidth: 3,
    borderLeftColor: "#D1D5DB", // gray-300
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 10,
    borderRadius: 6,
  },

  // Divider
  hr: {
    backgroundColor: "#F3F4F6",
    height: 1,
    marginVertical: 14,
  },

  // Images
  image: {
    borderRadius: 10,
    marginVertical: 10,
  },

  // Tables
  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB", // gray-200
    borderRadius: 8,
    marginVertical: 10,
    overflow: "hidden",
  },
  thead: {
    backgroundColor: "#F9FAFB",
  },
  th: {
    padding: 8,
    fontWeight: "600",
    color: "#111827",
    fontSize: 13,
  },
  td: {
    padding: 8,
    fontSize: 13,
    color: "#4B5563",
  },
  tr: {
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
});