"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { AnnoyedIcon, ChevronRight, Contact, LayoutGrid, ListCollapse, Package, PenTool, Regex, Truck } from "lucide-react";
import { fetchCategories } from "@/utils/productApi";
import type { CategoryListItem } from "@/types/product.types";

const quickLinks = [
  { label: "All Products", href: "/products", icon: Package },
  { label: "Track Order", href: "/track-order", icon: Truck },
    { label: "Contact Us", href: "/contact", icon: Contact },
        { label: "About Us", href: "/about", icon: AnnoyedIcon },
    {label:"Faqs", href:"/faq", icon:Regex},
        {label:"Shipping Policy", href:"/shipping-policy", icon:PenTool},
          {label:"Return & Refund", href:"/return-refund-policy", icon:PenTool},
];

const CategoryBar = () => {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [openCategory, setOpenCategory] = useState(false);
  const [openPages, setOpenPages] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenCategory(false);
        setOpenPages(false)
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex justify-center w-full bg-white border-b border-gray-200" ref={dropdownRef}>
      <div className="flex items-center h-10 lg:w-250 xl:px-4 xl:w-7xl px-2 gap-1">
        {/* Categories Dropdown */}
        <div className="relative">
          <button
            onClick={() => {setOpenCategory(!openCategory); setOpenPages(false)}}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
          >
            <LayoutGrid size={14} />
            Categories
            <ChevronRight
              size={14}
              className={`transition-transform duration-200 ${openCategory ? "rotate-90" : ""}`}
            />
          </button>

          {/* Dropdown */}
          <div
            className={`absolute top-full left-0 mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top ${
              openCategory
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >

   {/* Dynamic Categories */}
            {categories.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Shop by Category
                </p>
                <div className="max-h-64 overflow-y-auto">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?categoryID=${cat.id}`}
                      onClick={() => setOpenCategory(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 group transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold group-hover:bg-blue-100 transition-colors">
                        {cat.name.charAt(0)}
                      </span>
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                        {cat.name}
                      </span>
                      <ChevronRight
                        size={14}
                        className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
        {/* Pages Dropdown */}
        <div className="relative">
          <button
            onClick={() => {setOpenPages(!openPages);
              setOpenCategory(false);}
            }
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
          >
            <ListCollapse size={14} />
            Pages
            <ChevronRight
              size={14}
              className={`transition-transform duration-200 ${openPages ? "rotate-90" : ""}`}
            />
          </button>

          {/* Dropdown */}
          <div
            className={`absolute top-full left-0 mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top ${
              openPages
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >

                        {/* Dynamic Categories */}
            {quickLinks.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Visit Pages
                </p>
                <div className="max-h-64 overflow-y-auto">
                  {quickLinks.map((l,i) => (
                    <Link
                      key={i}
                      href={l.href}
                      onClick={() => setOpenPages(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 group transition-colors"
                    >
                      <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold group-hover:bg-blue-100 transition-colors">
                        <l.icon />
                      </span>
                      
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                        {l.label}
                      </span>
                      <ChevronRight
                        size={14}
                        className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}
         


          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
