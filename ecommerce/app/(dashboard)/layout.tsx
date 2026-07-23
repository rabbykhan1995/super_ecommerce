"use client";

import { useState } from "react";
import { userStore } from "@/zustand/user.store";
import Header from "@/components/Dashboard/Header";
import SidePanel from "@/components/Dashboard/SidePanel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser: any = userStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[90vh] overflow-hidden bg-gray-50/80">
      <SidePanel user={currentUser} isOpen={isOpen} toggle={toggleSidebar} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header user={currentUser} toggle={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-2 lg:p-4">{children}</main>
      </div>
    </div>
  );
}
