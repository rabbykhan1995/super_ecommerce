"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchProducts } from "@/utils/productApi";
import ProductCard from "@/components/Cards/ProductCard";
import ProductFilter from "@/components/Filter/ProductFilter";
import FilterMobile from "@/components/Filter/FilterMobile";
import MobileFilterDrawer from "@/components/Filter/MobileFilterDrawer";
import type { EcomProduct, EcomProductFilters } from "@/types/product.types";

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Oldest", value: "oldest" },
  { label: "Price, low to high", value: "priceAsc" },
  { label: "Price, high to low", value: "priceDesc" },
  { label: "Name, A-Z", value: "nameAsc" },
  { label: "Name, Z-A", value: "nameDesc" },
  { label: "Best Selling", value: "bestSelling" },
];

function parseNumberArray(value: string | null): number[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => parseInt(v.trim(), 10))
    .filter((n) => !isNaN(n));
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<EcomProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 12;

  const filters = useMemo(() => ({
    sort: searchParams.get("sort") || "latest",
    categoryID: parseNumberArray(searchParams.get("categoryID")),
    brandID: parseNumberArray(searchParams.get("brandID")),
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minRating: searchParams.get("minRating") || "",
    inStock: searchParams.get("inStock") === "true",
    search: searchParams.get("search") || "",
  }), [searchParams]);

  const totalPages = Math.ceil(total / limit);

  const updateParams = useCallback(
    (key: string, value: unknown) => {
      const params = new URLSearchParams(searchParams.toString());

      if (key === "categoryID" || key === "brandID") {
        const arr = value as number[];
        if (arr.length > 0) {
          params.set(key, arr.join(","));
        } else {
          params.delete(key);
        }
      } else if (key === "inStock") {
        if (value) {
          params.set("inStock", "true");
        } else {
          params.delete("inStock");
        }
      } else if (key === "sort") {
        if (value === "latest") {
          params.delete("sort");
        } else {
          params.set("sort", value as string);
        }
      } else if (value && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }

      params.delete("page");
      router.push(`/products?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const resetFilters = useCallback(() => {
    router.push("/products", { scroll: false });
  }, [router]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({
        page,
        limit,
        search: filters.search || undefined,
        sort: filters.sort as EcomProductFilters["sort"],
        categoryID: filters.categoryID.length > 0 ? filters.categoryID : undefined,
        brandID: filters.brandID.length > 0 ? filters.brandID : undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        minRating: filters.minRating ? Number(filters.minRating) : undefined,
        inStock: filters.inStock || undefined,
        published: true,
      });
      setProducts(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <div className="">
      <FilterMobile
        onOpenFilter={() => setMobileDrawerOpen(true)}
        onOpenSort={() => setMobileSortOpen(true)}
      />

      <div className="flex">
        <div className="overflow-y-auto h-[90vh]">        <ProductFilter
          filters={filters}
          onFilterChange={updateParams}
          onReset={resetFilters}
          total={total}
        /></div>


        <main className="flex-1 px-2 py-8 overflow-y-auto h-[90vh]">
          {filters.search && (
            <p className="text-sm text-gray-500 mb-4">
              Results for &quot;{filters.search}&quot;
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-md aspect-square" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products found</p>
              <button
                onClick={resetFilters}
                className="mt-4 text-sm text-[#F7311E] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    disabled={page === 1}
                    onClick={() => updateParams("page", page - 1)}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => updateParams("page", page + 1)}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <MobileFilterDrawer
        open={mobileDrawerOpen}
        setOpen={setMobileDrawerOpen}
        filters={filters}
        onFilterChange={updateParams}
        onReset={() => {
          resetFilters();
          setMobileDrawerOpen(false);
        }}
        total={total}
      />

      {/* Mobile Sort Bottom Sheet */}
      {mobileSortOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[80] lg:hidden"
            onClick={() => setMobileSortOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[90] p-4 lg:hidden">
            <h3 className="text-sm font-semibold mb-3">Sort By</h3>
            <div className="space-y-3">
              {SORT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <input
                    type="radio"
                    name="mobile-sort-sheet"
                    checked={filters.sort === opt.value}
                    onChange={() => {
                      updateParams("sort", opt.value);
                      setMobileSortOpen(false);
                    }}
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
            <button
              onClick={() => setMobileSortOpen(false)}
              className="w-full mt-4 py-2 text-sm font-medium text-white bg-black rounded-lg"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}
