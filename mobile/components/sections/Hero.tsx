import { Image as ExpoImage } from "expo-image";
import { useRef, useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { getImageUrl } from "../../lib/utils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CAROUSEL_HEIGHT = SCREEN_WIDTH * 0.5;

interface BannerItem {
  id: number;
  link?: string;
  photo: string;
  title?: string;
}

interface HeroProps {
  banners: BannerItem[];
}

export default function Hero({ banners }: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef(null);

  if (!banners || banners.length === 0) return null;

  return (
    <View className="mb-4">
      <Carousel
        ref={ref}
        data={banners}
        width={SCREEN_WIDTH}
        height={CAROUSEL_HEIGHT}
        autoPlay
        autoPlayInterval={4000}
        loop
        // 1. Math.round handles index calculation reliably even during fast manual swipes
        onProgressChange={(_, absoluteProgress) => {
          const index = Math.round(absoluteProgress) % banners.length;
          if (index !== activeIndex) {
            setActiveIndex(index);
          }
        }}
        renderItem={({ item }) => {
          const imageSource = getImageUrl(item?.photo);

          return (
            <Pressable
              style={{
                width: SCREEN_WIDTH,
                height: CAROUSEL_HEIGHT,
                backgroundColor: "#F3F4F6",
              }}
            >
              <ExpoImage
                source={imageSource}
                style={{
                  width: SCREEN_WIDTH,
                  height: CAROUSEL_HEIGHT,
                }}
                contentFit="cover"
                transition={200}
                cachePolicy="disk"
              />
            </Pressable>
          );
        }}
      />

      {/* Indicators */}
      <View className="flex-row justify-center items-center mt-3">
        {banners.map((_, index) => {
          const isActive = activeIndex === index;
          return (
            <View
              key={index}
              style={{
                height: 8,
                width: isActive ? 24 : 8, // Expanded width for active dot
                borderRadius: 4,
                marginHorizontal: 4,
              }}
              className={isActive ? "bg-primary" : "bg-gray-300"}
            />
          );
        })}
      </View>
    </View>
  );
}