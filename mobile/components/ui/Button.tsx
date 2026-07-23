import { Pressable, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
  className,
}: ButtonProps) {
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
