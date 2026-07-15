"use client";
import Link from "next/link";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { userStore } from "@/zustand/user.store";

interface MenuSliderProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MenuSlider: React.FC<MenuSliderProps> = ({ open, setOpen }) => {
  const { user, logout } = userStore();

  return (
    <>
      {!!open && (
        <div className="fixed top-5 left-5 z-[100]">
          <button onClick={() => setOpen(!open)} className=" text-black">
            <X size={24} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/10 z-[80]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-[70vw] lg:w-[40vw] bg-white shadow-lg z-[90] p-5 flex flex-col gap-4"
            >
              <div className="flex flex-col mt-15 text-lg font-bold uppercase">
                <Link
                  href="/"
                  className="border-b border-gray-400 text-black py-5 font-semibold"
                  onClick={() => setOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="border-b border-gray-400 text-black py-5 font-semibold"
                  onClick={() => setOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/products"
                  className="border-b border-gray-400 text-black py-5 font-semibold"
                  onClick={() => setOpen(false)}
                >
                  Products
                </Link>
                <Link
                  href="/contact"
                  className="border-b border-gray-400 text-black py-5 font-semibold"
                  onClick={() => setOpen(false)}
                >
                  Contact
                </Link>
                {!user ? (
                  <Link
                    href="/login"
                    className="mt-auto text-black py-5 font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                ) : (
                  <Link
                    href="/user"
                    className="mt-auto text-black py-5 font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>
                )}
                {!!user && (
                  <button
                    onClick={logout}
                    className="mt-5 text-white bg-[#fa5a5a] py-5 font-semibold cursor-pointer"
                  >
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MenuSlider;
