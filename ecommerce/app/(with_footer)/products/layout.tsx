import Filter from "@/components/Filter/Filter";
import FilterMobile from "@/components/Filter/FilterMobile";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {" "}
      <FilterMobile />
      <div className="flex lg:px-20 ">
        <Filter />
        <main className="max-h-screen  overflow-y-scroll scrollbar-hide">
          {children}
        </main>
      </div>
    </>
  );
}
