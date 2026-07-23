"use client";
import Link from "next/link";
import { X, ChevronRight, Home, Info, Package, Phone, User, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { userStore } from "@/zustand/user.store";
import { fetchCategories } from "@/utils/productApi";
import type { CategoryListItem } from "@/types/product.types";
import BrandLogo from "../Logos/BrandLogo";

interface MenuSliderProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const pageLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "About", href: "/about", icon: Info },
  { name: "Products", href: "/products", icon: Package },
  { name: "Contact", href: "/contact", icon: Phone },
  { name: "Track Order", href: "/track-order", icon: Package },
  { name: "FAQ", href: "/faq", icon: Info },
];

const MenuSlider: React.FC<MenuSliderProps> = ({ open, setOpen }) => {
  const { user, logout } = userStore();
  const [categories, setCategories] = useState<CategoryListItem[]>([]);

  useEffect(() => {
    if (open) {
      fetchCategories()
        .then(setCategories)
        .catch(() => setCategories([]));
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-[80vw] sm:w-[70vw] max-w-sm bg-white z-[90] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <BrandLogo />
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* User Section */}
              {user && (
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              )}

              {/* Page Links */}
              <div className="py-2">
                <p className="px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Pages
                </p>
                {pageLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </Link>
                ))}
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="py-2 border-t border-gray-100">
                  <p className="px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Categories
                  </p>
                  <div className="max-h-60 overflow-y-auto">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?categoryID=${cat.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-bold">
                            {cat.name.charAt(0)}
                          </span>
                          <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-gray-100 p-4 space-y-2">
              {!user ? (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <User size={16} />
                  Login
                </Link>
              ) : (
                <>
                  <Link
                    href="/user"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <User size={16} />
                    My Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MenuSlider;
