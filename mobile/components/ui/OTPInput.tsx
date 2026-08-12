import { useRef, useEffect, useState } from "react";
import { TextInput, View, Text } from "react-native";

type OTPInputProps = {
  value: string;
  onChange: (otp: string) => void;
  validTime?: number;
};

export default function OTPInput({ value, onChange, validTime = 120 }: OTPInputProps) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(validTime);

  const otpArray = value.split("").concat(Array(6).fill("")).slice(0, 6);

  useEffect(() => {
    setTimeLeft(validTime);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [validTime]);

  const handleChange = (val: string, index: number) => {
    if (!/^[0-9]?$/.test(val)) return;

    const newOtp = [...otpArray];
    newOtp[index] = val;

    const otpString = newOtp.join("").trim();
    onChange(otpString);

    if (val && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otpArray[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="items-center gap-2">
      <View className="flex-row justify-center gap-2">
        {otpArray.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => {
              inputs.current[index] = el;
            }}
            maxLength={1}
            keyboardType="numeric"
            value={digit}
            onChangeText={(val) => handleChange(val, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            className="w-12 h-12 border border-gray-300 rounded-lg text-center text-lg font-semibold text-gray-900 bg-white"
            placeholderTextColor="#9CA3AF"
          />
        ))}
      </View>

      <Text className="text-sm text-gray-500">
        {timeLeft > 0
          ? `OTP valid for ${timeLeft}s`
          : "OTP expired. Please resend."}
      </Text>
    </View>
  );
}
