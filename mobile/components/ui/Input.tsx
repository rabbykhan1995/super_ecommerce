import { useState } from "react";
import { TextInput, View, Text, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  error,
  multiline,
  numberOfLines,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      )}
      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry ? !showPassword : false}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          className={`border ${error ? "border-red-500" : "border-gray-300"} rounded-lg py-3 text-gray-900 bg-white ${secureTextEntry ? "pr-12" : "px-4"}`}
          placeholderTextColor="#9CA3AF"
          style={secureTextEntry ? { paddingLeft: 16 } : undefined}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </Pressable>
        )}
      </View>
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
