# Task 28 — Hero Carousel Section

> **Phase**: 8 — Home Screen
> **Say**: "generate task 28" or "generate task 28"

## Objective

Create a banner carousel using `react-native-reanimated-carousel`.

## Reference

`/ecommerce/components/Sections/Hero.tsx`

## File to Create

### `mobile/components/sections/Hero.tsx`

## Implementation

```tsx
import { useRef } from "react";
import { View, Pressable, Dimensions } from "react-native";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import ExpoImage from "expo-image";
import { useSharedValue } from "react-native-reanimated";
import { getImageUrl } from "../../lib/utils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface HeroProps {
  banners: any[];
}

export default function Hero({ banners }: HeroProps) {
  const progressValue = useSharedValue(0);
  const ref = useRef(null);

  if (!banners || banners.length === 0) return null;

  return (
    <View className="mb-4">
      <Carousel
        ref={ref}
        data={banners}
        width={SCREEN_WIDTH}
        height={SCREEN_WIDTH * 0.5}
        autoPlay
        autoPlayInterval={4000}
        loop
        onProgressChange={(_, absoluteProgress) => {
          progressValue.value = absoluteProgress;
        }}
        renderItem={({ item }) => (
          <Pressable className="flex-1">
            <ExpoImage
              source={{ uri: getImageUrl(item.image) }}
              className="w-full h-full"
              contentFit="cover"
              transition={300}
            />
          </Pressable>
        )}
      />

      {/* Pagination Dots */}
      <View className="flex-row justify-center mt-2">
        {banners.map((_, index) => {
          const isActive = Math.round(progressValue.value) === index;
          return (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 ${isActive ? "bg-primary w-6" : "bg-gray-300 w-2"}`}
            />
          );
        })}
      </View>
    </View>
  );
}
```

## Key Points

- Auto-play carousel with 4-second interval
- Infinite loop
- Pagination dots with active indicator
- `expo-image` for banner images

## Verify

Carousel auto-plays, dots update, images load correctly.
