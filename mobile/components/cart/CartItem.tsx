import { View, Text, Pressable } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import { getImageUrl } from "../../lib/utils";

interface CartItemProps {
  item: any;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <View className="flex-row p-4 bg-white border-b border-gray-50">
      <ExpoImage
        source={{ uri: getImageUrl(item.thumbnail) }}
        className="w-20 h-20 rounded-lg"
        contentFit="contain"
        transition={200}
      />

      <View className="flex-1 ml-3">
        <Text className="font-medium text-gray-900" numberOfLines={1}>
          {item.name}
        </Text>

        {item.attributes && item.attributes.length > 0 && (
          <Text className="text-xs text-gray-500 mt-0.5">
            {item.attributes.map((a: any) => `${a.name}: ${a.value}`).join(", ")}
          </Text>
        )}

        <Text className="text-primary font-semibold mt-1">৳{item.price}</Text>

        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
              className="bg-gray-100 rounded-lg p-1.5"
            >
              <Minus size={14} color="#4B5563" />
            </Pressable>
            <Text className="font-medium text-gray-900 w-8 text-center">{item.quantity}</Text>
            <Pressable
              onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="bg-gray-100 rounded-lg p-1.5"
            >
              <Plus size={14} color="#4B5563" />
            </Pressable>
          </View>

          <Pressable onPress={() => onRemove(item.id)} className="p-1.5">
            <Trash2 size={18} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
