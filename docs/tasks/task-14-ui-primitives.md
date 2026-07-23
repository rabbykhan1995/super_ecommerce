# Task 14 — Button, Input, Card, Badge

> **Phase**: 4 — UI Primitives
> **Say**: "generate task 14" or "generate task 14"

## Objective

Create reusable UI primitive components for the app.

## Files to Create

### `mobile/components/ui/Button.tsx`

```tsx
import { Pressable, Text, ActivityIndicator, View } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function Button({ title, onPress, variant = "primary", loading, disabled, icon, className }: ButtonProps) {
  const base = "flex-row items-center justify-center rounded-lg py-3 px-6";
  const variants = {
    primary: "bg-primary",
    outline: "border border-primary bg-transparent",
    ghost: "bg-transparent",
  };
  const textVariants = {
    primary: "text-white font-semibold",
    outline: "text-primary font-semibold",
    ghost: "text-primary font-medium",
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${disabled ? "opacity-50" : ""} ${className || ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#F7311E"} />
      ) : (
        <>
          {icon}
          <Text className={`${textVariants[variant]} ${icon ? "ml-2" : ""}`}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
```

### `mobile/components/ui/Input.tsx`

```tsx
import { TextInput, View, Text } from "react-native";

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

export default function Input({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, error, multiline, numberOfLines }: InputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        className={`border ${error ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-3 text-gray-900 bg-white`}
        placeholderTextColor="#9CA3AF"
      />
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
```

### `mobile/components/ui/Card.tsx`

```tsx
import { View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <View className={`bg-white rounded-xl p-4 shadow-sm ${className || ""}`}>
      {children}
    </View>
  );
}
```

### `mobile/components/ui/Badge.tsx`

```tsx
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
```

## Verify

Import each component in a test screen — renders correctly, props work.
