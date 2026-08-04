"use client";

import { useEffect, useState } from "react";
import { X, Loader2, User, Mail, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import useOpenCloseState from "@/zustand/openclose.store";
import { userStore } from "@/zustand/user.store";
import { checkoutMobile, updateProfile } from "@/utils/userApi";

const UpdateProfileModal = () => {
  const updateProfileModalOpen = useOpenCloseState(
    (s) => s.updateProfileModalOpen
  );
  const setUpdateProfileModalOpen = useOpenCloseState(
    (s) => s.setUpdateProfileModalOpen
  );
  const user = userStore((s) => s.user);
  const setUser = userStore((s) => s.setUser);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (updateProfileModalOpen && user) {
      setName(user.name || "");
      setMobile(user.mobile || "");
      setAddress(user.address || "");
    }
  }, [updateProfileModalOpen, user]);

  useEffect(() => {
    if (updateProfileModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [updateProfileModalOpen]);

  if (!updateProfileModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!mobile.trim()) {
      toast.error("Contact number is required");
      return;
    }

    setLoading(true);
    try {
      const updated = await checkoutMobile({
        name: name.trim(),
        mobile: mobile.trim(),
        address: address.trim() || undefined,
      });
      setUser({ ...user!, ...updated });
      setUpdateProfileModalOpen(false);
      toast.success("Profile updated successfully");
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-[#0000006c] flex items-center justify-center p-4"
      onClick={() => setUpdateProfileModalOpen(false)}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-br from-orange-500 to-amber-500">
          <button
            onClick={() => setUpdateProfileModalOpen(false)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X size={16} />
          </button>
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-3">
            <User size={22} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Complete Your Profile</h2>
          <p className="text-sm text-white/80 mt-0.5">
            Please add your contact number so we can reach you about orders.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <User
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-300"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
              />
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Mobile / Contact */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Contact Number
            </label>
            <div className="relative">
              <Phone
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
              />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-300"
                placeholder="01XXXXXXXXX"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin
                size={15}
                className="absolute left-3.5 top-3.5 text-gray-300"
              />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-300 resize-none"
                placeholder="Enter your address"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm shadow-orange-500/20"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfileModal;
