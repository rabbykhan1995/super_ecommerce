import { View, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Menu, ShoppingCart } from "lucide-react-native";
import { useCartStore } from "../../store/cart.store";
import useOpenCloseState from "../../store/openclose.store";

export default function Header() {
  const totalCartItems = useCartStore((s) => s.totalCartItems);
  const setOpenMenuSlider = useOpenCloseState((s) => s.setOpenMenuSlider);
  const setOpenCartSlider = useOpenCloseState((s) => s.setOpenCartSlider);

  return (
    <SafeAreaView edges={["top"]} className="bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => setOpenMenuSlider(true)} className="p-2">
          <Menu size={24} color="#1F2937" />
        </Pressable>

        <Text className="text-lg font-bold text-gray-900">Super Ecommerce</Text>

        <Pressable onPress={() => setOpenCartSlider(true)} className="p-2 relative">
          <ShoppingCart size={24} color="#1F2937" />
          {totalCartItems > 0 && (
            <View className="absolute -top-1 -right-1 bg-primary rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">{totalCartItems}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
