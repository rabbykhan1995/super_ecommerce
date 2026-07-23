"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPublicOrder } from "@/utils/checkoutApi";
import type { EcomOrder } from "@/types/order.types";
import OrderTracker from "./OrderTracker";
import { Search, Package } from "lucide-react";
import toast from "react-hot-toast";

const TrackOrderPage = () => {
  const searchParams = useSearchParams();
  const initialOrderNo = searchParams.get("orderNo") || "";

  const [orderNo, setOrderNo] = useState(initialOrderNo);
  const [searchValue, setSearchValue] = useState(initialOrderNo);
  const [order, setOrder] = useState<EcomOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = searchValue.trim();
    if (!val) return toast.error("Please enter an order number");

    setLoading(true);
    setSearched(true);
    try {
      const data = await getPublicOrder(val);
      setOrder(data);
      setOrderNo(val);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container_custom py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-gray-500">
            Enter your order number to see the current status
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Enter order number (e.g. ORD-20260722-000001)"
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="global_button px-6 py-3 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </div>
        </form>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && searched && !order && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500">
              No order found with number &quot;{orderNo}&quot;
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Please check the order number and try again.
            </p>
          </div>
        )}

        {!loading && order && <OrderTracker order={order} />}
      </div>
    </div>
  );
};

export default TrackOrderPage;
