"use client";

import { useState } from "react";
import { changePassword } from "@/utils/userApi";
import { Lock, Eye, EyeOff, Loader2, Shield, Check } from "lucide-react";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSaved(true);
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const passwordFields = [
    {
      label: "Current Password",
      value: currentPassword,
      onChange: setCurrentPassword,
      show: showCurrent,
      toggle: () => setShowCurrent(!showCurrent),
      placeholder: "Enter your current password",
    },
    {
      label: "New Password",
      value: newPassword,
      onChange: setNewPassword,
      show: showNew,
      toggle: () => setShowNew(!showNew),
      placeholder: "Enter a new password",
    },
    {
      label: "Confirm New Password",
      value: confirmPassword,
      onChange: setConfirmPassword,
      show: showConfirm,
      toggle: () => setShowConfirm(!showConfirm),
      placeholder: "Confirm your new password",
    },
  ];

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
                We recommend choosing a strong password you haven't used elsewhere
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {passwordFields.map((field) => (
            <div key={field.label}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {field.label}
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                />
                <input
                  type={field.show ? "text" : "password"}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-300"
                  placeholder={field.placeholder}
                />
                <button
                  type="button"
                  onClick={field.toggle}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}

          {/* Password Tips */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              A strong password should:
            </p>
            <ul className="space-y-1.5">
              {[
                "Be at least 6 characters long",
                "Include a mix of letters and numbers",
                "Not be the same as your current password",
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

          {/* Submit */}
          <div className="pt-2">
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
      </div>
    </div>
  );
};

export default SettingsPage;
