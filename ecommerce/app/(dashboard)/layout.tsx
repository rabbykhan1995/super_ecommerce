"use client";

import { useState } from "react";
import { userStore } from "@/zustand/user.store";
import Header from "@/components/Dashboard/Header";
import SidePanel from "@/components/Dashboard/SidePanel";

export default function DashboardLayout({
  admin,
  user,
}: {
  admin: React.ReactNode;
  user: React.ReactNode;
}) {
  const currentUser: any = userStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}

      <SidePanel user={currentUser} />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header user={currentUser} toggle={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4">
          {!!currentUser?.admin ? admin : user}
        </main>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 lg:hidden"
        />
      )}
    </div>
  );
}
