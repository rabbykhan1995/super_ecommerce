import { useState } from "react";
import { View, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Package, ZoomIn } from "lucide-react-native";
import { getImageUrl } from "../../lib/utils";

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const DOUBLE_TAP_SCALE = 2.5;

interface ZoomableImageProps {
  uri: string;
  width: number;
  height: number;
}

function ZoomableImage({ uri, width, height }: ZoomableImageProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const [showHint, setShowHint] = useState(true);

  const hideHint = () => {
    setShowHint(false);
  };

  const clampTranslate = () => {
    "worklet";
    const maxTranslateX = (width * (scale.value - 1)) / 2;
    const maxTranslateY = (height * (scale.value - 1)) / 2;

    translateX.value = withTiming(
      Math.max(-maxTranslateX, Math.min(maxTranslateX, translateX.value)),
      { duration: 200 },
    );
    translateY.value = withTiming(
      Math.max(-maxTranslateY, Math.min(maxTranslateY, translateY.value)),
      { duration: 200 },
    );
    savedTranslateX.value = translateX.value;
    savedTranslateY.value = translateY.value;
  };

  const resetZoom = () => {
    "worklet";
    scale.value = withTiming(MIN_SCALE, { duration: 250 });
    translateX.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(0, { duration: 250 });
    savedScale.value = MIN_SCALE;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const newScale = Math.min(MAX_SCALE, Math.max(0.5, savedScale.value * e.scale));
      scale.value = newScale;
      runOnJS(hideHint)();
    })
    .onEnd(() => {
      if (scale.value < MIN_SCALE) {
        scale.value = withTiming(MIN_SCALE, { duration: 200 });
        translateX.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(0, { duration: 200 });
        savedScale.value = MIN_SCALE;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        savedScale.value = scale.value;
        clampTranslate();
      }
    });

  const pan = Gesture.Pan()
    .minPointers(1)
    .onUpdate((e) => {
      if (scale.value > 1) {
        runOnJS(hideHint)();
        const maxTranslateX = (width * (scale.value - 1)) / 2;
        const maxTranslateY = (height * (scale.value - 1)) / 2;
        translateX.value = Math.max(
          -maxTranslateX,
          Math.min(maxTranslateX, savedTranslateX.value + e.translationX),
        );
        translateY.value = Math.max(
          -maxTranslateY,
          Math.min(maxTranslateY, savedTranslateY.value + e.translationY),
        );
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .onEnd(() => {
      runOnJS(hideHint)();
      if (scale.value > MIN_SCALE) {
        resetZoom();
      } else {
        scale.value = withTiming(DOUBLE_TAP_SCALE, { duration: 250 });
        savedScale.value = DOUBLE_TAP_SCALE;
      }
    });

  const composed = Gesture.Race(
    doubleTap,
    Gesture.Simultaneous(pinch, pan),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View className="relative">
      <GestureDetector gesture={composed}>
        <Animated.View style={{ width, height }} className="overflow-hidden">
          <ExpoImage
            source={uri}
            style={{ width, height }}
            contentFit="contain"
            transition={300}
            cachePolicy="memory-disk"
          />
        </Animated.View>
      </GestureDetector>

      {showHint && (
        <View className="absolute bottom-3 right-3 flex-row items-center gap-1 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <ZoomIn size={12} color="white" />
          <Animated.Text className="text-white text-[10px] opacity-70">
            Pinch or double-tap to zoom
          </Animated.Text>
        </View>
      )}
    </View>
  );
}

interface ProductImageGalleryProps {
  images: string[];
  thumbnail?: string | null;
}

export default function ProductImageGallery({ images, thumbnail }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { width: screenWidth } = useWindowDimensions();
  const imageSize = screenWidth - 32;

  const allImages: string[] = [];
  const seen = new Set<string>();

  if (thumbnail) {
    const t = thumbnail.trim();
    if (t && !seen.has(t)) {
      allImages.push(t);
      seen.add(t);
    }
  }
  for (const img of images) {
    if (!img) continue;
    const trimmed = img.trim();
    if (trimmed && !seen.has(trimmed)) {
      allImages.push(trimmed);
      seen.add(trimmed);
    }
  }

  if (allImages.length === 0) {
    return (
      <View className="aspect-square bg-gray-50 rounded-xl border border-gray-100 items-center justify-center">
        <Package size={48} color="#D1D5DB" />
      </View>
    );
  }

  return (
    <View>
      <View className="w-full bg-gray-50 rounded-xl overflow-hidden">
        <ZoomableImage
          uri={getImageUrl(allImages[activeIndex]).uri}
          width={imageSize}
          height={imageSize}
        />
      </View>

      {allImages.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          <View className="flex-row gap-2">
            {allImages.map((img, index) => (
              <Pressable
                key={index}
                onPress={() => setActiveIndex(index)}
                className={`rounded-lg overflow-hidden border-2 ${activeIndex === index ? "border-primary" : "border-gray-200"}`}
              >
                <ExpoImage
                  source={getImageUrl(img)}
                  style={{ width: 64, height: 64 }}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
