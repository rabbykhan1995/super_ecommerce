"use client";

import { Search, ShoppingBag } from "lucide-react";
import CartSlider from "../Sliders/CartSlider";
import { useState } from "react";
import Link from "next/link";
import { userStore } from "@/zustand/user.store";
import { cartStore } from "@/zustand/cart.store";

const NavbarDestop = () => {
  const { user, logout } = userStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {totalCartItems, openCartSlider,setOpenCartSlider} = cartStore();

  return (
    <>
      <div className="top-0 sticky w-full h-20 hidden lg:block border-b border-gray-300 bg-white z-20">
        {/* Top Container */}
        <div className="flex items-center justify-between h-full px-20">
          <div>Logo & Name</div>
          {/* Routes */}
          <div className="flex gap-8 font-semibold text-[13px] uppercase">
            <Link className="Hover_Border" href={"/"}>
              Home
            </Link>
            <Link className="Hover_Border" href={"/about"}>
              About
            </Link>
            {/* Dropdown Menu */}
            <div className="relative group">
              <button className="Hover_Border flex items-center gap-1 uppercase">
                Programs
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
            <Link className="Hover_Border" href={"#"}>
              Nutritions
            </Link>

            <Link className="Hover_Border" href={"/contact"}>
              Contact
            </Link>
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
              <span className="absolute bg-black text-white top-[-7] right-[-12] rounded-full text-[9px] w-5 h-5 flex items-center justify-center">
                {totalCartItems || 0}
              </span>
            </button>
          </div>
        </div>
      </div>
  
    </>
  );
};

export default NavbarDestop;
