# Task 25 — SortSheet

> **Phase**: 7 — Product Components
> **Say**: "generate task 25" or "generate task 25"

## Objective

Create a bottom sheet for sorting product listings.

## File to Create

### `mobile/components/filter/SortSheet.tsx`

## Implementation

```tsx
import { useCallback, useMemo, forwardRef } from "react";
import { View, Text, Pressable } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { Check } from "lucide-react-native";

interface SortSheetProps {
  selected: string;
  onSelect: (sort: string) => void;
  onClose: () => void;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

const SortSheet = forwardRef<BottomSheet, SortSheetProps>(
  ({ selected, onSelect, onClose }, ref) => {
    const snapPoints = useMemo(() => ["40%"], []);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backgroundStyle={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
      >
        <View className="px-4 pt-4 pb-8">
          <Text className="text-lg font-bold mb-4">Sort By</Text>
          {SORT_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => { onSelect(option.value); onClose(); }}
              className="flex-row items-center justify-between py-3 border-b border-gray-50"
            >
              <Text className={`text-gray-700 ${selected === option.value ? "text-primary font-semibold" : ""}`}>
                {option.label}
              </Text>
              {selected === option.value && <Check size={20} color="#F7311E" />}
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    );
  }
);

export default SortSheet;
```

## Verify

Bottom sheet opens, options selectable, selected option highlighted, close on select.
