"use client";

import { Search } from "lucide-react";

interface Props {
  onSearchOpen: () => void;
}

const MobileTopBar = ({ onSearchOpen }: Props) => {
  return (
    <div className="sticky top-0 z-20 block lg:hidden bg-white border-b border-gray-200">
      <div className="flex items-center px-3 h-12">
        <button
          onClick={onSearchOpen}
          className="flex items-center gap-2 w-full bg-gray-100 rounded-lg px-3 py-2 text-gray-500"
        >
          <Search size={16} />
          <span className="text-sm">Search products...</span>
        </button>
      </div>
    </div>
  );
};

export default MobileTopBar;
