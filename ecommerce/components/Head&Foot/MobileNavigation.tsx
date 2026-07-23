"use client";

import { useState } from "react";
import MobileBottomNav from "@/components/Head&Foot/MobileBottomNav";
import SearchFromMobile from "@/components/Filter/SearchFromMobile";
import MenuSlider from "@/components/Sliders/MenuSliders";

const MobileNavigation = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <MobileBottomNav
        onSearchOpen={() => setSearchOpen(true)}
        onMenuOpen={() => setMenuOpen(true)}
      />
      <SearchFromMobile open={searchOpen} setOpen={setSearchOpen} />
      <MenuSlider open={menuOpen} setOpen={setMenuOpen} />
    </>
  );
};

export default MobileNavigation;
