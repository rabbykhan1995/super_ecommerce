"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { fetchProducts } from "@/utils/productApi";
import Helper from "@/helper/helper";
import type { EcomProduct } from "@/types/product.types";

const SearchFormLarge = () => {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<EcomProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchProducts({ search: keyword, limit: 5 });
      setSuggestions(data.items);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(searchKeyword);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchKeyword, fetchSuggestions]);

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchKeyword.trim())}`);
      setShowDropdown(false);
      setSuggestions([]);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
      className="flex items-center w-md xl:w-[600px] justify-start relative"
    >
      <div className="relative w-full" ref={inputRef}>
        <input
          onFocus={() => setShowDropdown(true)}
          value={searchKeyword}
          onChange={(e) => {
            setSearchKeyword(e.target.value);
            setShowDropdown(true);
          }}
          placeholder="Search for Products (e.g. biscuit, oil, drink)"
          className="outline-none w-full rounded-lg py-[8px] px-2 text-[#080808] bg-white border-2 border-[#1ea0f7] focus:shadow-lg transition-shadow"
        />
        {searchKeyword && (
          <button
            type="button"
            onClick={() => {
              setSearchKeyword("");
              setSuggestions([]);
            }}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-xl"
          >
            &times;
          </button>
        )}
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] text-2xl hover:scale-110 active:text-[#1ea0f7]"
        >
          <Search />
        </button>
      </div>

      {showDropdown && searchKeyword && (
        <div className="absolute top-full w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {loading && (
            <p className="text-center py-2 text-sm text-gray-500">Searching...</p>
          )}
          {!loading && suggestions.length === 0 && (
            <p className="text-center py-2 text-sm text-gray-500">No products found</p>
          )}
          {!loading &&
            suggestions.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                prefetch={false}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSearchKeyword("");
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
              >
                <Image
                  src={Helper.getImage(product.thumbnail)}
                  alt={product.name}
                  height={30}
                  width={30}
                  className="object-cover rounded-sm"
                />
                <div className="flex flex-col">
                  <span className="text-sm">{product.name}</span>
                  <span className="text-xs text-green-600 font-semibold">
                    ${product.salePrice.toFixed(2)}
                  </span>
                </div>
              </Link>
            ))}
        </div>
      )}
    </form>
  );
};

export default SearchFormLarge;
