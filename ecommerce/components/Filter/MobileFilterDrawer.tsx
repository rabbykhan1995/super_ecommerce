"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchCategories, fetchBrands } from "@/utils/productApi";
import type { CategoryListItem, BrandListItem } from "@/types/product.types";

interface MobileFilterDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  filters: {
    sort: string;
    categoryID: number[];
    brandID: number[];
    minPrice: string;
    maxPrice: string;
    minRating: string;
    inStock: boolean;
  };
  onFilterChange: (key: string, value: unknown) => void;
  onReset: () => void;
  total: number;
}

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Oldest", value: "oldest" },
  { label: "Price, low to high", value: "priceAsc" },
  { label: "Price, high to low", value: "priceDesc" },
  { label: "Name, A-Z", value: "nameAsc" },
  { label: "Name, Z-A", value: "nameDesc" },
  { label: "Best Selling", value: "bestSelling" },
];

const RATING_OPTIONS = [4, 3, 2, 1];

const MobileFilterDrawer = ({
  open,
  setOpen,
  filters,
  onFilterChange,
  onReset,
  total,
}: MobileFilterDrawerProps) => {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [brands, setBrands] = useState<BrandListItem[]>([]);

  useEffect(() => {
    if (open) {
      const load = async () => {
        try {
          const [cats, brs] = await Promise.all([fetchCategories(), fetchBrands()]);
          setCategories(cats);
          setBrands(brs);
        } catch (err) {
          console.error("Failed to load filters", err);
        }
      };
      load();
    }
  }, [open]);

  const toggleArrayItem = (key: "categoryID" | "brandID", id: number) => {
    const current = filters[key];
    const updated = current.includes(id)
      ? current.filter((v) => v !== id)
      : [...current, id];
    onFilterChange(key, updated);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 z-[80]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-[85vw] max-w-sm bg-white shadow-lg z-[90] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">
                Filters ({total} products)
              </h2>
              <button onClick={() => setOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Sort */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Sort By</h3>
                {SORT_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="mobile-sort"
                      checked={filters.sort === opt.value}
                      onChange={() => onFilterChange("sort", opt.value)}
                      className="peer hidden"
                    />
                    <span className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center peer-checked:bg-black peer-checked:border-black shrink-0">
                      {filters.sort === opt.value && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Categories</h3>
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filters.categoryID.includes(cat.id)}
                        onChange={() => toggleArrayItem("categoryID", cat.id)}
                        className="peer hidden"
                      />
                      <span className="w-4 h-4 rounded border border-gray-400 flex items-center justify-center peer-checked:bg-black peer-checked:border-black shrink-0">
                        {filters.categoryID.includes(cat.id) && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Brands */}
              {brands.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Brands</h3>
                  {brands.map((brand) => (
                    <label key={brand.id} className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filters.brandID.includes(brand.id)}
                        onChange={() => toggleArrayItem("brandID", brand.id)}
                        className="peer hidden"
                      />
                      <span className="w-4 h-4 rounded border border-gray-400 flex items-center justify-center peer-checked:bg-black peer-checked:border-black shrink-0">
                        {filters.brandID.includes(brand.id) && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm">{brand.name}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Price Range */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => onFilterChange("minPrice", e.target.value)}
                    className="input_field text-sm py-1"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                    className="input_field text-sm py-1"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Minimum Rating</h3>
                {RATING_OPTIONS.map((r) => (
                  <label key={r} className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="mobile-rating"
                      checked={filters.minRating === String(r)}
                      onChange={() => onFilterChange("minRating", String(r))}
                      className="peer hidden"
                    />
                    <span className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center peer-checked:bg-black peer-checked:border-black shrink-0">
                      {filters.minRating === String(r) && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm">{r}★ & up</span>
                  </label>
                ))}
              </div>

              {/* In Stock */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => onFilterChange("inStock", e.target.checked)}
                    className="peer hidden"
                  />
                  <span className="w-4 h-4 rounded border border-gray-400 flex items-center justify-center peer-checked:bg-black peer-checked:border-black shrink-0">
                    {filters.inStock && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className="text-sm font-medium">In Stock Only</span>
                </label>
              </div>
            </div>

            <div className="p-4 border-t flex gap-3">
              <button
                onClick={onReset}
                className="flex-1 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Reset All
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition"
              >
                Show Results
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileFilterDrawer;
