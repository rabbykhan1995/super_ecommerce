"use client";

import { useState } from "react";

import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  GraduationCap,
  Users,
  X,
  Menu,
  LogOut,
} from "lucide-react";
import { userStore } from "@/zustand/user.store";
import NavLink from "./Navlink";
import { adminRoutes, userRoutes } from "@/utils/routes/routes";

interface Props {
  user: any;
}

const SidePanel = ({ user }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const { logout } = userStore();

  const toggle = () => setIsOpen(!isOpen);
  
  const menuItems = user.admin === true? adminRoutes:userRoutes



  return (
    <>
      {/* Mobile Toggle Button */}
      {!isOpen && (
        <button
          className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
          onClick={toggle}
        >
          <Menu size={24} />
        </button>
      )}
   
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-primary text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <span className="text-xl font-bold tracking-wider">ADMIN PRO</span>
          <button className="lg:hidden" onClick={toggle}>
            <X size={24} />
          </button>
        </div>

        <nav className="mt-5 px-3 space-y-1 overflow-y-auto h-[calc(100vh-140px)]">
          {menuItems.map((item) => (
            <NavLink key={item.name} href={item.href} exact={item.exact}>
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggle}
        />
      )}
    </>
  );
};

export default SidePanel;
