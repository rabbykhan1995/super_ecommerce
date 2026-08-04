"use client";

import { useState, useEffect } from "react";
import { sendPasswordResetOTP, resetPassword } from "@/utils/userApi";
import { userStore } from "@/zustand/user.store";
import { Lock, Eye, EyeOff, Loader2, Shield, Check, Mail, KeyRound } from "lucide-react";
import toast from "react-hot-toast";

type Step = "email" | "otp" | "password";

const SettingsPage = () => {
  const { user, fetchUser } = userStore();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email not found. Please refresh the page.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetOTP(email);
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast.error("OTP is required");
      return;
    }

    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    setStep("password");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      toast.error("Password must include uppercase, lowercase, number, and special character");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, password: newPassword });
      setSaved(true);
      toast.success("Password changed successfully");
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("email");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: "email", label: "Email", icon: Mail },
    { id: "otp", label: "Verify", icon: KeyRound },
    { id: "password", label: "Reset", icon: Lock },
  ];

  const stepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="max-w-3xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">
          Keep your account safe and sound
        </p>
      </div>

      {/* Security Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">
                Change Password
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                We&apos;ll send a verification code to your email
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-center gap-2">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    i <= stepIndex
                      ? "bg-orange-50 text-orange-600"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  <s.icon size={14} />
                  <span>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${
                      i < stepIndex ? "bg-orange-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full pl-11 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm outline-none cursor-not-allowed text-gray-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-orange-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <KeyRound
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-300 tracking-widest text-center text-lg font-mono"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Enter the 6-digit code sent to <span className="font-medium text-gray-500">{email}</span>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow-sm shadow-orange-500/20"
                >
                  Verify Code
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-300"
                    placeholder="Enter a new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-300"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Tips */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  A strong password should:
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Be at least 8 characters long",
                    "Include uppercase and lowercase letters",
                    "Include at least one number",
                    "Include at least one special character",
                  ].map((tip) => (
                    <li
                      key={tip}
                      className="flex items-center gap-2 text-xs text-gray-400"
                    >
                      <div className="w-1 h-1 rounded-full bg-gray-300" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("otp")}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-orange-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Updating...
                    </>
                  ) : saved ? (
                    <>
                      <Check size={15} />
                      Updated
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;