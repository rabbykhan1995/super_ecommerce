"use client";

import { useState, useEffect } from "react";
import { userStore } from "@/zustand/user.store";
import { updateProfile } from "@/utils/userApi";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Check,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user, setUser } = userStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setMobile(user.mobile || "");
      setAddress(user.address || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        mobile: mobile.trim() || undefined,
        address: address.trim() || undefined,
      });
      setUser({ ...user!, ...updated });
      setSaved(true);
      toast.success("Profile updated successfully");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your personal information
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Cover / Avatar Area */}
        <div className="relative h-28 bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#44403c]">
          <div className="absolute -bottom-10 left-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                    <User size={28} className="text-white" />
                  </div>
                )}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-lg shadow-md border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100">
                <Camera size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Info Header */}
        <div className="pt-14 px-6 pb-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {user?.name || "Your Name"}
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-300"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                readOnly
                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm text-gray-400 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-300 mt-1.5 flex items-center gap-1">
              <Mail size={11} />
              Email address cannot be changed
            </p>
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Mobile Number
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-300"
              placeholder="01XXXXXXXXX"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 focus:bg-white transition-all resize-none placeholder:text-gray-300"
              placeholder="Enter your address"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-orange-500/20"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check size={15} />
                  Saved
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
