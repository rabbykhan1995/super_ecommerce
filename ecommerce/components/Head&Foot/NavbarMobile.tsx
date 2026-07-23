"use client";
import Link from "next/link";
import { Search, ShoppingBag, Menu } from "lucide-react";
import CartSlider from "../Sliders/CartSlider";
import { useState } from "react";
import MenuSlider from "../Sliders/MenuSliders";
import SearchFromMobile from "../Filter/SearchFromMobile";
import { cartStore } from "@/zustand/cart.store";
import { shadowsIntoLight } from "@/lib/font";
import BrandLogo from "../Logos/BrandLogo";
const NavbarMobile = () => {
  const [cartSlider, setCartSlider] = useState(false);
  const [menuSlider, setMenuSlider] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
    const {totalCartItems, openCartSlider,setOpenCartSlider} = cartStore();
  return (
    <>
      <div className="top-0 sticky w-full h-20 block lg:hidden border-b border-gray-300 bg-white z-20">
        {/* Top Container */}
        <div className="flex items-center justify-between h-full px-2">
          <div className="flex gap-5">
            <button onClick={() => setMenuSlider(true)}>
              <Menu size={20} color="#242424" />
            </button>
            <button onClick={() => setSearchOpen(true)}>
              <Search size={20} color="#242424" />
            </button>
          </div>
                   <BrandLogo />

          {/* Right Cart & Search */}
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
      <MenuSlider open={menuSlider} setOpen={setMenuSlider} />
      <SearchFromMobile open={searchOpen} setOpen={setSearchOpen} />
    </>
  );
};

export default NavbarMobile;
