"use client";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { userStore } from "@/zustand/user.store";
import { cartStore } from "@/zustand/cart.store";
import SearchFormLarge from "../Filter/SearchFromDesktop";
import BrandLogo from "../Logos/BrandLogo";
import CategoryBar from "./CategoryBar";
import { User, LogOut } from "lucide-react";

const NavbarDestop = () => {
  const { user, logout } = userStore();
  const { totalCartItems, openCartSlider, setOpenCartSlider } = cartStore();

  return (
    <div className="top-0 sticky w-full hidden lg:block z-20">
      {/* Main Navbar */}
      <div className="border-b border-gray-200 flex justify-center  bg-[#d9e8ffa9] backdrop-blur-2xl">
     
          <div className="flex items-center justify-between h-14  xl:px-4  px-2 xl:w-7xl lg:w-250 w-full">
            <Link href={'/'}>          <BrandLogo />
            </Link>


            <SearchFormLarge />

            <div className="flex items-center gap-4">
              {!user ? (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-white/60 rounded-lg transition-colors"
                >
                  <User size={16} />
                  Login
                </Link>
              ) : (
                <Link
                  href="/user"
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-white/60 rounded-lg transition-color/s"
                >
                  <User size={16} />
                  Profile
                </Link>
              )}

              {/* {user && (
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-white/60 rounded-lg transition-colors"
                >
                  <LogOut size={15} />
                </button>
              )} */}

              <button
                onClick={() => setOpenCartSlider(!openCartSlider)}
                className="relative p-2 hover:bg-white/60 rounded-lg transition-colors"
              >
                <ShoppingBag size={20} color="#242424" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white rounded-full text-[9px] w-[17px] h-[17px] flex items-center justify-center font-bold">
                    {totalCartItems}
                  </span>
                )}
              </button>
            </div>
          </div>


      </div>

      {/* Category Bar */}
      <CategoryBar />
    </div>
  );
};

export default NavbarDestop;
