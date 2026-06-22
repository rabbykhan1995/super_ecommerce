import { useRef, useEffect, useState } from "react";

type OTPInputProps = {
  value: string;
  onChange: (otp: string) => void;
  validTime?: number; // in seconds
};

export default function OTPInput({ value, onChange, validTime = 60 }: OTPInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(validTime);

  const otpArray = value.split("").concat(Array(6).fill("")).slice(0, 6);

  // Countdown effect
  useEffect(() => {
    setTimeLeft(validTime); // reset if validTime changes
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

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2 justify-center">
        {otpArray.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            className="w-12 h-12 text-center border rounded-lg text-lg font-semibold"
          />
        ))}
      </div>

      <p className="text-sm text-gray-500">
        {timeLeft > 0
          ? `OTP valid for ${timeLeft}s`
          : "OTP expired. Please resend."}
      </p>
    </div>
  );
}