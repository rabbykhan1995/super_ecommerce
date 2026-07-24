import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowUpDown, Search as SearchIcon, SlidersHorizontal, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "../../components/product/ProductCard";
import ProductCardSkeleton from "../../components/skeleton/ProductCardSkeleton";
import api from "../../lib/api";

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [query, setQuery] = useState((params.search as string) || "");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    (params.category as string) || null
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");

  const [brandSearch, setBrandSearch] = useState("");
  const [brandPage, setBrandPage] = useState(1);
  const [brandTotalPages, setBrandTotalPages] = useState(1);
  const [brandLoading, setBrandLoading] = useState(false);

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!query.trim() && !selectedCategory && !selectedBrand) {
      setProducts([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const queryParams = new URLSearchParams();
      if (query.trim()) queryParams.append("search", query.trim());
      if (selectedCategory) queryParams.append("categoryID", selectedCategory);
      if (selectedBrand) queryParams.append("brandID", selectedBrand);
      if (sortBy) queryParams.append("sort", sortBy);
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
  }, [query, selectedCategory, selectedBrand, sortBy]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  useEffect(() => {
    api
      .get("/category/list")
      .then((catRes) => {
        setCategories(Array.isArray(catRes.data?.data) ? catRes.data.data : []);
      })
      .catch(() => {});
  }, []);

  const fetchBrands = useCallback(async (search: string, page: number, append = false) => {
    setBrandLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.append("search", search.trim());
      queryParams.append("page", String(page));
      queryParams.append("limit", "20");

      const res = await api.get(`/brand/list?${queryParams.toString()}`);
      const data = res.data?.data;
      const items = data?.items || [];
      const totalPages = data?.totalPages || 1;

      if (append) {
        setBrands((prev) => [...prev, ...items]);
      } else {
        setBrands(items);
      }
      setBrandTotalPages(totalPages);
    } catch (err) {
      // Error handled by interceptor
    } finally {
      setBrandLoading(false);
    }
  }, []);

  useEffect(() => {
    setBrandPage(1);
    fetchBrands(brandSearch, 1, false);
  }, [brandSearch]);

  const loadMoreBrands = () => {
    if (brandPage < brandTotalPages && !brandLoading) {
      const nextPage = brandPage + 1;
      setBrandPage(nextPage);
      fetchBrands(brandSearch, nextPage, true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Search Bar */}
      <View className="flex-row items-center gap-2 px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <SearchIcon size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-sm text-gray-900"
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <X size={16} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
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

      {/* Active Filters */}
      {(selectedCategory || selectedBrand) && (
        <View className="flex-row items-center gap-2 px-4 py-2 bg-white border-b border-gray-100">
          {selectedCategory && (
            <Pressable
              onPress={() => setSelectedCategory(null)}
              className="flex-row items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full"
            >
              <Text className="text-primary text-xs font-medium">
                Category: {categories.find((c) => (c._id || c.id) === selectedCategory)?.name || selectedCategory}
              </Text>
              <X size={12} color="#F7311E" />
            </Pressable>
          )}
          {selectedBrand && (
            <Pressable
              onPress={() => setSelectedBrand(null)}
              className="flex-row items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full"
            >
              <Text className="text-primary text-xs font-medium">
                Brand: {brands.find((b) => (b._id || b.id) === selectedBrand)?.name || selectedBrand}
              </Text>
              <X size={12} color="#F7311E" />
            </Pressable>
          )}
        </View>
      )}

      {/* Brand Chips */}
      {!hasSearched && brands.length > 0 && (
        <View className="px-4 py-3 bg-white border-b border-gray-100">
          <Text className="text-sm font-semibold text-gray-900 mb-2">Brands</Text>
          <TextInput
            className="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-900 mb-2"
            placeholder="Search brands..."
            placeholderTextColor="#9CA3AF"
            value={brandSearch}
            onChangeText={setBrandSearch}
          />
          <FlatList
            data={brands}
            keyExtractor={(item) => String(item._id || item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            onEndReached={loadMoreBrands}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              brandLoading ? (
                <ActivityIndicator size="small" color="#F7311E" className="ml-2" />
              ) : null
            }
            renderItem={({ item }) => {
              const brandId = item._id || item.id;
              const isSelected = selectedBrand === brandId;
              return (
                <Pressable
                  onPress={() => setSelectedBrand(isSelected ? null : brandId)}
                  className={`px-4 py-2 rounded-full border mr-2 ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      isSelected ? "text-white font-medium" : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      )}

      {/* Results */}
      {loading ? (
        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={(item) => item.toString()}
          numColumns={2}
          renderItem={() => <ProductCardSkeleton />}
          contentContainerClassName="p-4"
        />
      ) : !hasSearched ? (
        <View className="flex-1 items-center justify-center px-4">
          <SearchIcon size={48} color="#D1D5DB" />
          <Text className="text-gray-400 text-lg mt-4">Search for products</Text>
          <Text className="text-gray-400 text-sm mt-1">
            Find what you're looking for
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) => String(item._id || item.id || index)}
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
