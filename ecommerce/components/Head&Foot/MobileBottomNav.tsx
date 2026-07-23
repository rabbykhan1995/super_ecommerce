"use client";

import { Home, Search, ShoppingBag, Menu } from "lucide-react";
import { cartStore } from "@/zustand/cart.store";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface Props {
  onSearchOpen: () => void;
  onMenuOpen: () => void;
}

const MobileBottomNav = ({ onSearchOpen, onMenuOpen }: Props) => {
  const pathname = usePathname();
  const { totalCartItems, setOpenCartSlider } = cartStore();

  const navItems = [
    {
      icon: <Home size={22} />,
      label: "Home",
      href: "/",
      isActive: pathname === "/",
    },
    {
      icon: <Search size={22} />,
      label: "Search",
      onClick: onSearchOpen,
      isActive: false,
    },
    {
      icon: (
        <div className="relative">
          <ShoppingBag size={22} />
          {totalCartItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#F7311E] text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {totalCartItems > 9 ? "9+" : totalCartItems}
            </span>
          )}
        </div>
      ),
      label: "Cart",
      onClick: () => setOpenCartSlider(true),
      isActive: false,
    },
    {
      icon: <Menu size={22} />,
      label: "Menu",
      onClick: onMenuOpen,
      isActive: false,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isLink = "href" in item && item.href;
            const isActive = "isActive" in item && item.isActive;

            if (isLink) {
              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 transition-colors ${
                    isActive ? "text-[#F7311E]" : "text-gray-500"
                  }`}
                >
                  {item.icon}
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            }

            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center gap-0.5 w-16 py-1 text-gray-500 transition-colors"
              >
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
