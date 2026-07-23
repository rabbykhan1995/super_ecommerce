import { View, Text } from "react-native";

interface BadgeProps {
  text: string;
  variant?: "success" | "error" | "warning" | "info";
  className?: string;
}

export default function Badge({ text, variant = "info", className }: BadgeProps) {
  const variants = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-gray-500",
  };

  return (
    <View className={`${variants[variant]} rounded-full px-2 py-0.5 ${className || ""}`}>
      <Text className="text-white text-xs font-medium">{text}</Text>
    </View>
  );
}
