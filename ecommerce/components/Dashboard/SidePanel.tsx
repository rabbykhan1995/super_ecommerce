"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { User, ShoppingCart, X, LogOut, ChevronRight } from "lucide-react";
import { userStore } from "@/zustand/user.store";
import { cartStore } from "@/zustand/cart.store";
import NavLink from "./Navlink";
import { userRoutes } from "@/utils/routes/routes";

interface Props {
  user: any;
  isOpen: boolean;
  toggle: () => void;
}

const SidePanel = ({ user, isOpen, toggle }: Props) => {
  const { logout } = userStore();
  const { totalCartItems } = cartStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-[#1c1917] via-[#292524] to-[#44403c] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Close Button (Mobile) */}
          <button
            onClick={toggle}
            className="lg:hidden absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={18} className="text-white/70" />
          </button>

          {/* User Card */}
          <div className="mx-4 mb-4 p-3.5 mt-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/20 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-orange-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-orange-200/50 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Cart Badge */}
          {totalCartItems > 0 && (
            <div className="mx-4 mb-2 flex items-center gap-2.5 px-3.5 py-2.5 bg-white/[0.04] rounded-xl text-sm border border-white/[0.04]">
              <ShoppingCart size={16} className="text-orange-300/70" />
              <span className="text-orange-100/60 text-xs">
                {totalCartItems} {totalCartItems === 1 ? "item" : "items"} in
                cart
              </span>
              <ChevronRight size={14} className="text-orange-200/30 ml-auto" />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
            <p className="px-4 pt-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-orange-200/30">
              Menu
            </p>
            {userRoutes.map((item) => (
              <NavLink key={item.name} href={item.href} exact={item.exact} onClick={toggle}>
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-orange-200/50 hover:text-red-400 hover:bg-white/[0.04] rounded-xl transition-all duration-200 group"
            >
              <LogOut
                size={18}
                className="group-hover:translate-x-[-2px] transition-transform"
              />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidePanel;
