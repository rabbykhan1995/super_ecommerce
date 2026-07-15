"use client";

import { useEffect, useState } from "react";
import { fetchCategories, fetchBrands } from "@/utils/productApi";
import type { CategoryListItem, BrandListItem } from "@/types/product.types";

interface ProductFilterProps {
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

const ProductFilter = ({ filters, onFilterChange, onReset, total }: ProductFilterProps) => {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [brands, setBrands] = useState<BrandListItem[]>([]);

  useEffect(() => {
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
  }, []);

  const toggleArrayItem = (key: "categoryID" | "brandID", id: number) => {
    const current = filters[key];
    const updated = current.includes(id)
      ? current.filter((v) => v !== id)
      : [...current, id];
    onFilterChange(key, updated);
  };

  return (
    <div className="space-y-6 lg:block hidden w-72 shrink-0">
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold uppercase">Filters</h1>
          <button
            onClick={onReset}
            className="text-xs text-[#F7311E] hover:underline"
          >
            Reset All
          </button>
        </div>
        <p className="text-[#646464] text-sm">{total} products</p>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Sort By</h2>
        {SORT_OPTIONS.map((opt) => (
          <label key={opt.value} className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="radio"
              name="sort"
              checked={filters.sort === opt.value}
              onChange={() => onFilterChange("sort", opt.value)}
              className="peer hidden"
            />
            <span className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center peer-checked:bg-black peer-checked:border-black">
              {filters.sort === opt.value && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span className="text-sm font-medium">{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Categories</h2>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.categoryID.includes(cat.id)}
                  onChange={() => toggleArrayItem("categoryID", cat.id)}
                  className="peer hidden"
                />
                <span className="w-4 h-4 rounded border border-gray-400 flex items-center justify-center peer-checked:bg-black peer-checked:border-black">
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
        </div>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Brands</h2>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.brandID.includes(brand.id)}
                  onChange={() => toggleArrayItem("brandID", brand.id)}
                  className="peer hidden"
                />
                <span className="w-4 h-4 rounded border border-gray-400 flex items-center justify-center peer-checked:bg-black peer-checked:border-black">
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
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Price Range</h2>
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
        <h2 className="text-sm font-semibold">Minimum Rating</h2>
        {RATING_OPTIONS.map((r) => (
          <label key={r} className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="radio"
              name="rating"
              checked={filters.minRating === String(r)}
              onChange={() => onFilterChange("minRating", String(r))}
              className="peer hidden"
            />
            <span className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center peer-checked:bg-black peer-checked:border-black">
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
          <span className="w-4 h-4 rounded border border-gray-400 flex items-center justify-center peer-checked:bg-black peer-checked:border-black">
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
  );
};

export default ProductFilter;
