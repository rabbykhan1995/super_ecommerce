import { useLocalSearchParams } from "expo-router";
import { ArrowUpDown, SlidersHorizontal, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "../../components/product/ProductCard";
import ProductCardSkeleton from "../../components/skeleton/ProductCardSkeleton";
import api from "../../lib/api";

export default function ProductsScreen() {
  const params = useLocalSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    (params.category as string) || null
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState(
    (params.search as string) || ""
  );
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedCategory) queryParams.append("categoryID", selectedCategory);
      if (selectedBrand) queryParams.append("brandID", selectedBrand);
      if (sortBy) queryParams.append("sort", sortBy);
      if (searchQuery) queryParams.append("search", searchQuery);
      queryParams.append("limit", "20");

      const res = await api.get(
        `/product/ecom-product-list?${queryParams.toString()}`
      );
      setProducts(res.data?.data?.items || res.data?.data || []);
    } catch (err) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedBrand, sortBy, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api
      .get("/category/list")
      .then((catRes) => {
        setCategories(Array.isArray(catRes.data?.data) ? catRes.data.data : []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api
      .get("/brand/list?limit=100")
      .then((brandRes) => {
        const data = brandRes.data?.data;
        setBrands(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>

      <View className="flex-row items-center gap-2 px-4 py-3 bg-white border-b border-gray-100">
        <Pressable
          onPress={() => setShowFilter(true)}
          className="flex-row items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg"
        >
          <SlidersHorizontal size={16} color="#4B5563" />
          <Text className="text-sm text-gray-700">Filter</Text>
        </Pressable>
        <Pressable
          onPress={() => setShowSort(true)}
          className="flex-row items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg"
        >
          <ArrowUpDown size={16} color="#4B5563" />
          <Text className="text-sm text-gray-700">Sort</Text>
        </Pressable>
      </View>

      {loading ? (
        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={(item) => item.toString()}
          numColumns={2}
          renderItem={() => <ProductCardSkeleton />}
          contentContainerClassName="p-4"
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) => item._id || index.toString()}
          numColumns={2}
          contentContainerClassName="p-4"
          columnWrapperStyle={{ gap: 8 }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-gray-500">No products found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="flex-1">
              <ProductCard product={item} />
            </View>
          )}
        />
      )}

      {showFilter && (
        <View className="absolute inset-0 z-50">
          <Pressable className="absolute inset-0 bg-black/40" onPress={() => setShowFilter(false)} />
          <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[75%]">
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
              <Text className="text-lg font-bold">Filters</Text>
              <Pressable onPress={() => setShowFilter(false)}>
                <X size={22} color="#1F2937" />
              </Pressable>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => String(item._id || item.id)}
              contentContainerClassName="px-4 pt-4 pb-8"
              ListHeaderComponent={
                <Text className="font-semibold text-gray-900 mb-3">Categories</Text>
              }
              renderItem={({ item }) => {
                const categoryId = item._id || item.id;
                const isSelected = selectedCategory === categoryId;
                return (
                  <Pressable
                    onPress={() => setSelectedCategory(isSelected ? null : categoryId)}
                    className={`px-4 py-2 rounded-full border mb-2 mr-2 self-start ${
                      isSelected ? "bg-primary border-primary" : "border-gray-300"
                    }`}
                  >
                    <Text className={isSelected ? "text-white font-medium" : "text-gray-700"}>
                      {item.name}
                    </Text>
                  </Pressable>
                );
              }}
              ListFooterComponent={
                <Pressable
                  onPress={() => setShowFilter(false)}
                  className="bg-primary py-3 rounded-lg items-center mt-4"
                >
                  <Text className="text-white font-semibold">Apply Filters</Text>
                </Pressable>
              }
            />
          </View>
        </View>
      )}

      {showSort && (
        <View className="absolute inset-0 z-50">
          <Pressable className="absolute inset-0 bg-black/40" onPress={() => setShowSort(false)} />
          <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl">
            <View className="px-4 pt-4 pb-8">
              <Text className="text-lg font-bold mb-4">Sort By</Text>
              {[
                { value: "newest", label: "Newest First" },
                { value: "price_asc", label: "Price: Low to High" },
                { value: "price_desc", label: "Price: High to Low" },
                { value: "popular", label: "Most Popular" },
                { value: "rating", label: "Highest Rated" },
              ].map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => { setSortBy(option.value); setShowSort(false); }}
                  className="flex-row items-center justify-between py-3 border-b border-gray-50"
                >
                  <Text className={`text-gray-700 ${sortBy === option.value ? "text-primary font-semibold" : ""}`}>
                    {option.label}
                  </Text>
                  {sortBy === option.value && <Text className="text-primary">✓</Text>}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
