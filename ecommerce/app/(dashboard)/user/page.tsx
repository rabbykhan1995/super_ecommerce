"use client";

import Link from "next/link";
import { userStore } from "@/zustand/user.store";
import {
  User,
  ShoppingBag,
  ShoppingCart,
  Settings,
  ArrowRight,
  Package,
  CreditCard,
} from "lucide-react";

const DashboardPage = () => {
  const user = userStore((state) => state.user);

  const quickActions = [
    {
      label: "My Orders",
      description: "Track and manage your orders",
      href: "/user/my-orders",
      icon: Package,
      light: "bg-orange-50 text-orange-600 ring-1 ring-orange-100",
    },
    {
      label: "My Cart",
      description: "Review items before checkout",
      href: "/user/my-cart",
      icon: ShoppingCart,
      light: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
    },
    {
      label: "My Profile",
      description: "Update your personal info",
      href: "/user/profile",
      icon: User,
      light: "bg-orange-50 text-orange-500 ring-1 ring-orange-100",
    },
    {
      label: "Settings",
      description: "Password and preferences",
      href: "/user/settings",
      icon: Settings,
      light: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
    },
  ];

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="max-w-5xl">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#44403c] p-8 lg:p-10 mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

        <div className="relative">
          <p className="text-orange-200/50 text-sm font-medium mb-1">
            Welcome back
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Hey, {firstName}
          </h1>
          <p className="text-orange-100/40 text-sm max-w-md leading-relaxed">
            Here's what's happening with your account today. Jump into your
            orders, update your profile, or tweak your settings.
          </p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-200/80 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${action.light}`}
              >
                <action.icon size={20} />
              </div>
              <ArrowRight
                size={16}
                className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all mt-1"
              />
            </div>
            <div className="mt-4">
              <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                {action.label}
              </h3>
              <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                {action.description}
              </p>
            </div>
          </Link>
        ))}

        {/* Quick Summary Card */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-gray-100 p-5 sm:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm ring-1 ring-gray-100">
              <CreditCard size={20} className="text-gray-600" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">
                Quick Tip
              </h3>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Keep your profile updated so we can deliver your orders smoothly.
            You can also change your password anytime from the settings page to
            keep your account secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
