import { useRef } from "react";
import { View, Pressable, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Image as ExpoImage } from "expo-image";
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
