"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { fetchProducts } from "@/utils/productApi";
import Helper from "@/helper/helper";
import type { EcomProduct } from "@/types/product.types";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const SearchFromMobile = ({ open, setOpen }: Props) => {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<EcomProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchKeyword("");
      setSuggestions([]);
    }
  }, [open]);

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
      setOpen(false);
    }
  };

  const close = () => {
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
        <button onClick={close} className="text-gray-500 shrink-0">
          <X size={22} />
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex-1 relative"
        >
          <input
            ref={inputRef}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search for products..."
            className="w-full outline-none rounded-lg py-2 px-3 pr-10 text-sm bg-gray-100 border border-gray-300 focus:border-[#1ea0f7] transition-colors"
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => {
                setSearchKeyword("");
                setSuggestions([]);
              }}
              className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            <Search size={18} />
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="text-center py-4 text-sm text-gray-500">Searching...</p>
        )}
        {!loading && searchKeyword && suggestions.length === 0 && (
          <p className="text-center py-4 text-sm text-gray-500">No products found</p>
        )}
        {!loading &&
          suggestions.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              prefetch={false}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
              onClick={close}
            >
              <Image
                src={Helper.getImage(product.thumbnail)}
                alt={product.name}
                height={40}
                width={40}
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
    </div>
  );
};

export default SearchFromMobile;
