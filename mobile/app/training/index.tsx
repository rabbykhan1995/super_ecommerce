import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image as ExpoImage } from "expo-image";
import api from "../../lib/api";
import { getImageUrl } from "../../lib/utils";

export default function TrainingScreen() {
  const router = useRouter();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/training/list")
      .then((res) => setPrograms(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-4 py-4 bg-white border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">Training & Programs</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={programs}
          keyExtractor={(item: any) => item._id}
          contentContainerClassName="p-4"
          renderItem={({ item }: any) => (
            <Pressable
              onPress={() => router.push(`/training/${item.slug || item._id}`)}
              className="bg-white rounded-xl overflow-hidden mb-4"
            >
              <ExpoImage source={{ uri: getImageUrl(item.image) }} className="w-full h-48" contentFit="cover" transition={300} />
              <View className="p-4">
                <Text className="font-bold text-gray-900 text-lg">{item.title}</Text>
                <Text className="text-gray-500 mt-1" numberOfLines={2}>{item.description}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
