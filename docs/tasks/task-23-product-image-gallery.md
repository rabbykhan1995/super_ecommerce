# Task 23 — ProductImageGallery

> **Phase**: 7 — Product Components
> **Say**: "generate task 23" or "generate task 23"

## Objective

Create a horizontal scrolling image gallery for product detail pages.

## Reference

`/ecommerce/components/Product/ProductImageGallery.tsx`

## File to Create

### `mobile/components/product/ProductImageGallery.tsx`

## Implementation

```tsx
import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import ExpoImage from "expo-image";
import { getImageUrl } from "../../lib/utils";

interface ProductImageGalleryProps {
  images: string[];
}

export default function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View>
      {/* Main Image */}
      <ExpoImage
        source={{ uri: getImageUrl(images[activeIndex]) }}
        className="w-full aspect-square rounded-xl"
        contentFit="contain"
        transition={300}
      />

      {/* Thumbnails */}
      {images.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 gap-2">
          {images.map((img, index) => (
            <Pressable
              key={index}
              onPress={() => setActiveIndex(index)}
              className={`rounded-lg overflow-hidden border-2 ${activeIndex === index ? "border-primary" : "border-gray-200"}`}
            >
              <ExpoImage
                source={{ uri: getImageUrl(img) }}
                className="w-16 h-16"
                contentFit="cover"
                transition={200}
              />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
```

## Key Points

- Main image with thumbnail selector below
- Active thumbnail highlighted with primary border
- `expo-image` for caching
- Horizontal scroll for many thumbnails

## Verify

Gallery renders, tapping thumbnails changes main image, border highlights active.
