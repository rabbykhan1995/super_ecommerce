import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { getImageUrl } from "../../lib/utils";

interface ProductImageGalleryProps {
  images: string[];
}

export default function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View>
      <ExpoImage
        source={{ uri: getImageUrl(images[activeIndex]) }}
        className="w-full aspect-square rounded-xl"
        contentFit="contain"
        transition={300}
      />

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
