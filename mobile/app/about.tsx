import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView className="flex-1 p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">About Us</Text>
        <Text className="text-gray-600 leading-6 mb-4">
          Welcome to Super Ecommerce — your one-stop destination for quality products at competitive prices.
        </Text>
        <Text className="text-gray-600 leading-6 mb-4">
          We are committed to providing exceptional customer service and a seamless shopping experience.
        </Text>
        <Text className="text-gray-600 leading-6">
          Our mission is to make online shopping accessible, affordable, and enjoyable for everyone.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
