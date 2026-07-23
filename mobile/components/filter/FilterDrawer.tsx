import { useMemo, forwardRef } from "react";
import { View, Text, Pressable } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";

interface FilterDrawerProps {
  categories: any[];
  brands: any[];
  selectedCategory: string | null;
  selectedBrand: string | null;
  priceRange: { min: number; max: number };
  onApply: (filters: any) => void;
  onClose: () => void;
}

const FilterDrawer = forwardRef<BottomSheet, FilterDrawerProps>(
  ({ categories, brands, selectedCategory, selectedBrand, priceRange, onApply, onClose }, ref) => {
    const snapPoints = useMemo(() => ["75%"], []);

    const handleApply = (filterState: any) => {
      onApply(filterState);
      (ref as any)?.current?.close();
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backgroundStyle={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
      >
        <View className="flex-row items-center justify-between px-4 pb-3 border-b border-gray-100">
          <Text className="text-lg font-bold">Filters</Text>
          <Pressable onPress={onClose}>
            <X size={22} color="#1F2937" />
          </Pressable>
        </View>

        <BottomSheetScrollView className="flex-1 px-4 pt-4">
          <Text className="font-semibold text-gray-900 mb-3">Categories</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <Pressable
                key={cat._id}
                className={`px-4 py-2 rounded-full border ${selectedCategory === cat._id ? "bg-primary border-primary" : "border-gray-300"}`}
              >
                <Text className={selectedCategory === cat._id ? "text-white font-medium" : "text-gray-700"}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="font-semibold text-gray-900 mb-3">Brands</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {brands.map((brand) => (
              <Pressable
                key={brand._id}
                className={`px-4 py-2 rounded-full border ${selectedBrand === brand._id ? "bg-primary border-primary" : "border-gray-300"}`}
              >
                <Text className={selectedBrand === brand._id ? "text-white font-medium" : "text-gray-700"}>
                  {brand.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => handleApply({ category: selectedCategory, brand: selectedBrand, priceRange })}
            className="bg-primary py-3 rounded-lg items-center mb-8"
          >
            <Text className="text-white font-semibold">Apply Filters</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

FilterDrawer.displayName = "FilterDrawer";

export default FilterDrawer;
