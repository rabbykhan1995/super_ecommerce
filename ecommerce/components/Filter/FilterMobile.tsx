import { ChevronDown, Settings2 } from "lucide-react";

const FilterMobile = () => {
  return (
    <div className="sticky w-full top-20 h-10 lg:hidden flex border-b bg-white border-gray-300 items-center text-gray-500">
      <button className="w-1/2 flex h-full items-center justify-center border-r border-gray-300">
        <Settings2 />
        <span>FIlter </span>
      </button>
      <button className="w-1/2 flex h-full items-center justify-center">
        <span>Sort by</span> <ChevronDown />
      </button>
    </div>
  );
};

export default FilterMobile;
