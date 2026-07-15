"use client";

import { ChevronDown, Settings2 } from "lucide-react";

interface FilterMobileProps {
  onOpenFilter?: () => void;
  onOpenSort?: () => void;
}

const FilterMobile = ({ onOpenFilter, onOpenSort }: FilterMobileProps) => {
  return (
    <div className="sticky w-full top-20 h-10 lg:hidden flex border-b bg-white border-gray-300 items-center text-gray-500 z-10">
      <button
        onClick={onOpenFilter}
        className="w-1/2 flex h-full items-center justify-center border-r border-gray-300 gap-1"
      >
        <Settings2 size={16} />
        <span>Filter</span>
      </button>
      <button
        onClick={onOpenSort}
        className="w-1/2 flex h-full items-center justify-center gap-1"
      >
        <span>Sort by</span>
        <ChevronDown size={16} />
      </button>
    </div>
  );
};

export default FilterMobile;
