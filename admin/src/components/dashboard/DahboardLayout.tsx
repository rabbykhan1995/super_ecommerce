import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import {
  LogOut,
  Menu,
  X,

  ChevronRight,
  TextAlignCenter,
} from "lucide-react";

import { dashboardStore } from "../../stores/dashboard.store";
import Helper from "../../utils/helper";
import DarkLightToggle from "../buttons/DarkLightToggle";
import { AdminRoutes } from "../../routes/admin.routes";
import { userStore } from "../../stores/user.store";


export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const { sidePanel, setSidePanel } = dashboardStore();
const mobileSidePanelRef = useRef<HTMLDivElement | null>(null);
  const { logout } = userStore();

  const filteredRoutes = AdminRoutes
    .map((item) => {
      // Parent-এর permission থাকলে check
      if (item.permission && !Helper.isPermitter(item.permission)) {
        return null;
      }

      // Sub items filter
      if (item.subItems) {
        const allowedSubItems = item.subItems.filter(
          (subItem) =>
            !subItem.permission ||
            Helper.isPermitter(subItem.permission)
        );

        // কোনো sub item accessible না হলে parent-ও hide
        if (allowedSubItems.length === 0) {
          return null;
        }

        return {
          ...item,
          subItems: allowedSubItems,
        };
      }

      return item;
    })
    .filter(Boolean);

  const handleLogout = (): void => {
    Helper.clearToken();
    logout();
  };

  const toggleSubmenu = (index: number): void => {
    setActiveSubmenu((prev) => (prev === index ? null : index));
  };

  const navItems = filteredRoutes;

useEffect(() => {
  if (mobileOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [mobileOpen]);


useEffect(() => {
  const handleOutsideClick = (event: MouseEvent) => {
    if (
      mobileOpen &&
      mobileSidePanelRef.current &&
      !mobileSidePanelRef.current.contains(event.target as Node)
    ) {
      setMobileOpen(false);
    }
  };

  document.addEventListener("mousedown", handleOutsideClick);

  return () => {
    document.removeEventListener("mousedown", handleOutsideClick);
  };
}, [mobileOpen]);

  return (
    <div className="text-[rgb(var(--primary-text))]">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-4 py-3 z-50 border-b border-[rgb(var(--primary-border))] bg-[rgb(var(--primary-bg))]">

        {!sidePanel && <button
          onClick={() => setSidePanel(!sidePanel)}
          className="global_button bg-amber-50 text-black hidden lg:block"
        >
          <TextAlignCenter size={20} />
        </button>}
 

        <div className="lg:hidden items-center gap-3 flex">
          <DarkLightToggle />

          <button
            onClick={handleLogout}
            className="cursor-pointer"
            title="Logout"
          >
            <LogOut size={20} />
          </button>


        </div>
        <h1 className="text-lg font-bold">Shokher Bazar</h1>
        <div className="lg:flex items-center gap-3 hidden">
          <DarkLightToggle />

          <button
            onClick={handleLogout}
            className="cursor-pointer"
            title="Logout"
          >
            <LogOut size={20} />
          </button>


        </div>
               <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Sidebar */}
      <div
      ref={mobileSidePanelRef}
        className={`lg:hidden fixed top-0 bg-[rgb(var(--primary-bg))] left-0 pt-16 h-screen w-64 z-40 transition-translate duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <ul className="p-4 space-y-3 overflow-y-auto h-[calc(100vh-4rem)] font-semibold">
          {navItems.map((item, index) => (
            <li key={index}>
              {item!.subItems ? (
                <>
                  <div
                    onClick={() => toggleSubmenu(index)}
                    className="flex items-center justify-between cursor-pointer px-3 py-2 rounded-md hover:bg-orange-500"
                  >
                    <div className="flex items-center gap-3">
                      {item!.icon}
                      {item!.name}
                    </div>
                    <ChevronRight
                      size={18}
                      className={`transition-all duration-300 ease-in-out ${activeSubmenu === index ? "rotate-90" : ""
                        }`}
                    />
                  </div>

                  {activeSubmenu === index && (
                    <ul className="ml-8 mt-2 space-y-2">
                      {item!.subItems.map((sub, i) => (
                        <li key={i}>
                          <NavLink
                            to={sub.link}
                            className={({ isActive }) =>
                              `flex items-center gap-2 px-2 py-2 text-sm rounded-md ${isActive ? "bg-orange-600" : "hover:bg-orange-500"
                              }`
                            }
                            onClick={() => setMobileOpen(false)}
                          >
                            {sub.icon}
                            {sub.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink
                  to={item!.link!}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md ${isActive ? "bg-orange-600" : "hover:bg-orange-500"
                    }`
                  }
                >
                  {item!.icon}
                  {item!.name}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col fixed top-0 left-0 pt-16 h-screen bg-[rgb(var(--primary-bg))]  transition-all duration-300 overflow-hidden ${sidePanel ? "w-[260px]" : "w-0"
          }`}
      >
        <div
          // className={`hidden lg:block fixed top-16 z-50 transition-all duration-300 ${
          //   sidePanel ? "left-[260px]" : "left-0"
          // }`}
          className="flex justify-end w-full"
        >
          <button
            onClick={() => setSidePanel(!sidePanel)}
            className="global_button  mr-4"
          >
            <TextAlignCenter size={20} />
          </button>
        </div>
        <ul className="overflow-y-auto h-[calc(100vh-4rem)] p-4 space-y-3">
          {navItems.map((item, index) => (
            <li key={index}>
              {item!.subItems ? (
                <>
                  <div
                    onClick={() => toggleSubmenu(index)}
                    className="flex items-center justify-between cursor-pointer px-3 py-2 rounded-md hover:bg-orange-500"
                  >
                    <div className="flex items-center gap-3">
                      {item!.icon}
                      {item!.name}
                    </div>
                    <ChevronRight
                      size={18}
                      className={`transition-all duration-300 ${activeSubmenu === index ? "rotate-90" : ""
                        }`}
                    />
                  </div>

                  {activeSubmenu === index && (
                    <ul className="ml-8 mt-2 space-y-2">
                      {item!.subItems.map((sub, i) => (
                        <li key={i}>
                          <NavLink
                            to={sub.link}
                            className={({ isActive }) =>
                              `flex items-center gap-2 px-2 py-2 text-sm rounded-md ${isActive ? "bg-orange-600" : "hover:bg-orange-500"
                              }`
                            }

                          >
                            {sub.icon}
                            {sub.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink
                  to={item!.link!}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md ${isActive ? "bg-orange-600" : "hover:bg-orange-500"
                    }`
                  }
                >
                  {item!.icon}
                  {item!.name}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </div>


    </div>
  );
}