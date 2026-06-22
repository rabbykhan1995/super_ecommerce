"use client";

import api from "@/utils/apiconfig";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userStore } from "@/zustand/user.store";
import toast from "react-hot-toast";
import OTPInput from "@/utils/Ui/OTPInput";
const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSended, setOtpSended] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const { setUser } = userStore()

  useEffect(() => {
    if (!otpSended) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSended]);


  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("password is not matched")
    }
    const res = await api.post('/user/reset-password', {
      email, password, otp
    })

    if (res.data.success === false) {
      return;
    }
    setUser(res.data.data);
    if (res.data.data.admin === true) {
      return router.push('/admin')
    }
    router.push('/user');
  };
  const handleSendOTP = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();



    const res = await api.post('/user/send-forget-password-otp', {
      email,
    });
    if (res.data.success === true) {

      setOtpSended(true)
      setTimeLeft(300);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          Login to Your Account
        </h2>

        {/* Login Form */}
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="text"
              placeholder="Enter email or mobile"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 outline-none rounded-lg"
              required
            />
          </div>

          {otpSended ? (
            <div>
              {timeLeft > 0 ? (
                <button
                  type="button"
                  disabled
                  className="w-full bg-[#5c5c5c] text-white py-2 rounded-lg mb-5"
                >
                  OTP sent. Resend in {timeLeft}s
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="w-full bg-[#313131] text-white py-2 rounded-lg mb-5"
                >
                  Resend OTP
                </button>
              )}

              <OTPInput value={otp} onChange={(val) => setOtp(val)} validTime={300} />
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={handleSendOTP}
                className="w-full bg-[#313131] text-white py-2 rounded-lg"
              >
                Send OTP
              </button>
            </div>
          )}
          {!otpSended ? null : <> {/* mobile */}

            {/* password */}
            <div>
              <label className="text-sm font-medium">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 outline-none rounded-lg"
                required
              />
            </div>
            {/* confirm password */}
            <div>
              <label className="text-sm font-medium">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 outline-none rounded-lg"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#313131] text-white py-2 rounded-lg"
            >
              Sign Up
            </button></>}
        </form>


      </div>
    </div>
  );
};

export default ForgetPasswordPage;
