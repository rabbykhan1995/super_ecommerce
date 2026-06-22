"use client";

import { useEffect, useState } from "react";

import { CardProduct } from "@/types/product.types";
import api from "@/utils/apiconfig";
import ProductCard from "@/components/Cards/ProductCard";

export default function TrainingPage() {
  const [products, setPrograms] = useState<CardProduct[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / limit);

  const fetchProducts = async (pageNumber: number) => {
    try {
      setLoading(true);

      const res = await api.get("/product/list", {
        params: {
          page: pageNumber,
          limit,
        },
      });

      setPrograms(res.data.data.items);
      setTotal(res.data.data.total);
    } catch (err) {
      console.error("Failed to fetch trainings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  return (
    <div className="px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Training Programs</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product, i) => (
              <ProductCard
                key={i}
                title={product.title ?? ""}

                thumbnail={product.thumbnail}
                slug={product.slug}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
