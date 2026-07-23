"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyOrders, cancelOrder } from "@/utils/checkoutApi";
import type { EcomOrder, OrderStatus } from "@/types/order.types";
import {
  Package,
  Eye,
  Truck,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShoppingBag,
  Calendar,
  Hash,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
  hold: "bg-orange-50 text-orange-600 ring-1 ring-orange-100",
  confirmed: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
  processing: "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100",
  shipped: "bg-purple-50 text-purple-600 ring-1 ring-purple-100",
  delivered: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  cancelled: "bg-red-50 text-red-600 ring-1 ring-red-100",
  failed: "bg-red-50 text-red-600 ring-1 ring-red-100",
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<EcomOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchOrders = async (p: number) => {
    setLoading(true);
    try {
      const data = await getMyOrders(p, 10);
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const handleCancel = async (orderNo: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(orderNo);
    try {
      await cancelOrder(orderNo);
      fetchOrders(page);
    } catch {
      // handled by interceptor
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        <p className="text-sm text-gray-400 mt-1">
          View and manage all your orders in one place
        </p>
      </div>

      {loading && orders.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-white rounded-2xl border border-gray-100 p-5"
            >
              <div className="flex justify-between">
                <div className="space-y-2.5">
                  <div className="h-3.5 w-32 bg-gray-100 rounded-lg" />
                  <div className="h-3 w-48 bg-gray-100 rounded-lg" />
                </div>
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
            <ShoppingBag size={30} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1.5">
            No orders yet
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">
            When you place an order, it will show up here so you can track it.
          </p>
          <Link
            href="/products"
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm shadow-orange-500/20"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:shadow-gray-100 transition-all duration-300"
            >
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Hash size={14} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 tracking-tight">
                      {order.orderNo}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">
                        {order.items?.length || 0} items
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-12 sm:ml-0">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                      STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {order.totalAmount} TK
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50 ml-12 sm:ml-12">
                <Link
                  href={`/user/my-orders/${order.orderNo}`}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  <Eye size={13} />
                  Details
                </Link>
                <Link
                  href={`/track-order?orderNo=${order.orderNo}`}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  <Truck size={13} />
                  Track
                </Link>
                {order.status === "pending" && (
                  <button
                    onClick={() => handleCancel(order.orderNo)}
                    disabled={cancelling === order.orderNo}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 ml-auto"
                  >
                    {cancelling === order.orderNo ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <XCircle size={13} />
                    )}
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-400 px-3 font-medium">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
