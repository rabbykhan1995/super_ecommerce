"use client";
import { Search, ShoppingBag } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { userStore } from "@/zustand/user.store";
import { cartStore } from "@/zustand/cart.store";
import SearchFormLarge from "../Filter/SearchFromDesktop";
import { shadowsIntoLight } from "@/lib/font";
import BrandLogo from "../Logos/BrandLogo";

const NavbarDestop = () => {
  const { user, logout } = userStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { totalCartItems, openCartSlider, setOpenCartSlider } = cartStore();

  return (
    <>
      <div className="top-0 sticky w-full hidden lg:block border-b border-gray-300 bg-[#d9e8ffa9] backdrop-blur-2xl z-20">
        {/* Top Container */}
        <div className="h-full flex justify-center w-full">
          <div className="flex items-center justify-between h-14 lg:w-250 xl:px-4 xl:w-7xl px-2">
           <BrandLogo />
            {/* Routes */}
            <div className="flex gap-8 font-semibold text-[15px] uppercase">

              <SearchFormLarge />
              {!user ? (
                <Link href="/login" className="Hover_Border">
                  Login
                </Link>
              ) : user.admin === false ? (
                <Link href="/user" className="Hover_Border">
                  Profile
                </Link>
              ) : (
                <Link href="/admin" className="Hover_Border">
                  Admin Panel
                </Link>
              )}
              {!!user && (
                <button onClick={logout} className="Hover_Border">
                  Logout
                </button>
              )}
            </div>
            {/* Right Cart & Search */}
            <div className="flex gap-5">
              <Search size={20} color="#242424" />
              <button
                onClick={() => {
                  setOpenCartSlider(!openCartSlider);
                }}
                className="relative"
              >
                <ShoppingBag size={20} color="#242424" />
             { totalCartItems>0&&  <span className="absolute bg-[#0052CC] text-white top-[-8] right-[-10] rounded-full text-[9px] w-[17px] h-[17px] flex items-center justify-center">
                  {totalCartItems || 0}
                </span>}
              </button>
            </div>
          </div>
        </div>

          <div className="flex justify-center w-full bg-white">
          <div className="flex items-center justify-between h-8 lg:w-250 xl:px-4 xl:w-7xl px-2">
                {/* Dropdown Menu */}
              <div className="relative group">
                <button className="Hover_Border flex items-center gap-1 uppercase">
                  Categories
                  <span className="text-xs">▼</span>
                </button>

                <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-lg border border-gray-200 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link
                    href={"/training&programs"}
                    className="block px-4 py-2 hover:bg-slate-100 text-slate-800"
                  >
                    Training Programs
                  </Link>
                  <Link
                    href={"/blog"}
                    className="block px-4 py-2 hover:bg-slate-100 text-slate-800"
                  >
                    Blog
                  </Link>
                  <Link
                    href={"/products"}
                    className="block px-4 py-2 hover:bg-slate-100 text-slate-800"
                  >
                    Products
                  </Link>
                </div>
              </div>
          </div>
        </div>

      </div>

    </>
  );
};

export default NavbarDestop;
