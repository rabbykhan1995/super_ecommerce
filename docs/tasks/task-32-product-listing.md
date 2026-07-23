# Task 32 — Product Listing (with Filters)

> **Phase**: 9 — Product Screens
> **Say**: "generate task 32" or "generate task 32"

## Objective

Create the product listing screen with filters, sorting, and search.

## Reference

`/ecommerce/app/(with_footer)/products/page.tsx`

## File to Create

### `mobile/app/(tabs)/products.tsx` (or `mobile/app/products/index.tsx`)

## Implementation

```tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { View, FlatList, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import Header from "../../components/layout/Header";
import ProductCard from "../../components/product/ProductCard";
import FilterDrawer from "../../components/filter/FilterDrawer";
import SortSheet from "../../components/filter/SortSheet";
import ProductCardSkeleton from "../../components/skeleton/ProductCardSkeleton";
import api from "../../lib/api";

export default function ProductsScreen() {
  const params = useLocalSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>((params.category as string) || null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState((params.search as string) || "");

  const filterRef = useRef<BottomSheet>(null);
  const sortRef = useRef<BottomSheet>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedCategory) queryParams.append("category", selectedCategory);
      if (selectedBrand) queryParams.append("brand", selectedBrand);
      if (sortBy) queryParams.append("sort", sortBy);
      if (searchQuery) queryParams.append("search", searchQuery);

      const res = await api.get(`/product/ecom-product-list?${queryParams.toString()}`);
      setProducts(res.data?.data || []);
    } catch (err) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedBrand, sortBy, searchQuery]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    Promise.all([api.get("/category/list"), api.get("/brand/list")]).then(([catRes, brandRes]) => {
      setCategories(catRes.data?.data || []);
      setBrands(brandRes.data?.data || []);
    });
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <Header />

      {/* Filter & Sort Bar */}
      <View className="flex-row items-center gap-2 px-4 py-3 bg-white border-b border-gray-100">
        <Pressable onPress={() => filterRef.current?.expand()} className="flex-row items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg">
          <SlidersHorizontal size={16} color="#4B5563" />
          <Text className="text-sm text-gray-700">Filter</Text>
        </Pressable>
        <Pressable onPress={() => sortRef.current?.expand()} className="flex-row items-center gap-1 bg-gray-100 px-3 py-2 rounded-lg">
          <ArrowUpDown size={16} color="#4B5563" />
          <Text className="text-sm text-gray-700">Sort</Text>
        </Pressable>
      </View>

      {/* Products Grid */}
      {loading ? (
        <FlatList data={[1, 2, 3, 4]} numColumns={2} renderItem={() => <ProductCardSkeleton />} contentContainerClassName="p-4" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
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

      {/* Filter Drawer */}
      <FilterDrawer
        ref={filterRef}
        categories={categories}
        brands={brands}
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        priceRange={{ min: 0, max: 100000 }}
        onApply={(filters) => {
          setSelectedCategory(filters.category);
          setSelectedBrand(filters.brand);
        }}
        onClose={() => filterRef.current?.close()}
      />

      {/* Sort Sheet */}
      <SortSheet
        ref={sortRef}
        selected={sortBy}
        onSelect={setSortBy}
        onClose={() => sortRef.current?.close()}
      />
    </SafeAreaView>
  );
}
```

## Key Points

- Filter and sort via bottom sheets
- Category/brand query params from navigation
- 2-column product grid
- Loading skeletons
- Empty state message

## Verify

Products load, filter/sort work, navigation from home with category param works.
