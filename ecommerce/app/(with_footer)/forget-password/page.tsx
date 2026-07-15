"use client";

import api from "@/utils/apiconfig";
import Helper from "@/helper/helper";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userStore } from "@/zustand/user.store";
import toast from "react-hot-toast";
import OTPInput from "@/utils/Ui/OTPInput";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { setUser } = userStore();

  useEffect(() => {
    if (!otpSent) return;
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
  }, [otpSent]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleSendOTP = async () => {
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      await api.post("/auth/send-forget-password-otp", { email });
      setOtpSent(true);
      setTimeLeft(300);
      toast.success("OTP sent to your email");
    } catch (err: any) {
      const msg = err.response?.data?.msg || "Failed to send OTP";
      setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }
    if (!password || password.length < 8) {
      setErrors({ password: "Minimum 8 characters required" });
      return;
    }
    if (otp.length !== 6) {
      setErrors({ otp: "Enter the 6-digit OTP" });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const res = await api.post("/auth/reset-password", { email, password, otp });
      Helper.setToken(res.data.token);
      setUser(res.data.data);
      toast.success("Password reset successful!");
      router.push("/");
    } catch (err: any) {
      const msg = err.response?.data?.msg || "Reset failed";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Enter your email and we&apos;ll send you a verification code
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          {errors.general && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  disabled={otpSent}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-gray-50"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                Send OTP
              </button>
            ) : (
              <>
                <div className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm text-center">
                  Code sent to <span className="font-semibold">{email}</span>
                  {timeLeft > 0 && (
                    <span className="ml-2 text-blue-500">({formatTime(timeLeft)})</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                  <OTPInput value={otp} onChange={(val) => setOtp(val)} validTime={300} />
                  {errors.otp && <p className="text-red-500 text-xs mt-1.5">{errors.otp}</p>}
                </div>

                {timeLeft === 0 && (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
                  >
                    Resend OTP
                  </button>
                )}

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
                </div>

                {/* Confirm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Reset Password
                </button>
              </>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="text-gray-900 font-semibold hover:underline inline-flex items-center gap-1">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
