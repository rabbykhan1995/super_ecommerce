# Task 51 — Training Detail Screen

> **Phase**: 13 — Training
> **Say**: "generate task 51" or "generate task 51"

## Objective

Create the training program detail screen.

## Reference

`/ecommerce/app/(with_footer)/training/[slug]/page.tsx`

## File to Create

### `mobile/app/training/[slug].tsx`

## Implementation

```tsx
import { useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import ExpoImage from "expo-image";
import api from "../../lib/api";
import { getImageUrl } from "../../lib/utils";

export default function TrainingDetailScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/training/${slug}`)
      .then((res) => setProgram(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!program) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Program not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </Pressable>
        <Text className="font-semibold text-gray-900" numberOfLines={1}>{program.title}</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ExpoImage source={{ uri: getImageUrl(program.image) }} className="w-full h-56" contentFit="cover" transition={300} />
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">{program.title}</Text>
          <Text className="text-gray-600 leading-6">{program.description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

## Verify

Program detail loads with image, title, and description.
