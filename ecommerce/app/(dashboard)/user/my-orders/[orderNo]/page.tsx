"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getOrderDetail } from "@/utils/checkoutApi";
import type { EcomOrder, OrderStatus } from "@/types/order.types";
import Image from "next/image";
import Helper from "@/helper/helper";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  XCircle,
} from "lucide-react";

const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  hold: "On Hold",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  hold: "bg-orange-100 text-orange-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
};

const OrderDetailPage = () => {
  const params = useParams();
  const orderNo = params.orderNo as string;
  const [order, setOrder] = useState<EcomOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderDetail(orderNo);
        setOrder(data);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNo]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="h-48 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Order not found.</p>
        <Link href="/user/my-orders" className="global_button inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(order.status as OrderStatus);
  const isTerminal = ["cancelled", "failed"].includes(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/user/my-orders"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{order.orderNo}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {order.status}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">
          Order Status
        </h3>
        {isTerminal ? (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl ${
              order.status === "cancelled"
                ? "bg-red-50 text-red-700"
                : "bg-orange-50 text-orange-700"
            }`}
          >
            {order.status === "cancelled" ? (
              <XCircle size={16} />
            ) : (
              <XCircle size={16} />
            )}
            <span className="font-semibold capitalize">
              Order {STATUS_LABELS[order.status]}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {STATUS_FLOW.map((status, idx) => {
              const isActive = idx <= currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <div key={status} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? "bg-blue-600 text-white"
                          : isActive
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isActive && !isCurrent ? "✓" : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-1 whitespace-nowrap ${
                        isCurrent
                          ? "text-blue-600 font-bold"
                          : isActive
                            ? "text-green-600 font-medium"
                            : "text-gray-400"
                      }`}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                  {idx < STATUS_FLOW.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mb-5 ${
                        idx < currentIndex ? "bg-green-300" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Link
          href={`/track-order?orderNo=${order.orderNo}`}
          className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Truck size={16} />
          Track on Public Page
        </Link>
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className="relative w-14 h-14 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                <Image
                  src={Helper.getImage(item.thumbnail)}
                  alt={item.productName}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {item.productName}
                </p>
                {item.variantAttrs && item.variantAttrs.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {item.variantAttrs.map((a) => a.value).join(" / ")}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-0.5">
                  {item.discountPrice &&
                  item.discountPrice > 0 &&
                  item.discountPrice < item.salePrice
                    ? item.discountPrice
                    : item.salePrice}{" "}
                  TK x {item.quantity}
                </p>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {item.lineTotal} TK
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-semibold text-gray-900">
              {order.subtotal} TK
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span className="font-semibold text-green-600">Free</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-2">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{order.totalAmount} TK</span>
          </div>
        </div>
      </div>

      {/* Payment & Shipping */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Payment</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Method</span>
              <span className="font-semibold text-gray-900 capitalize">
                {order.paymentMethod === "stripe"
                  ? "Stripe (Card)"
                  : order.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : order.paymentMethod || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-gray-900 capitalize">
                {order.paymentStatus}
              </span>
            </div>
            {order.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Paid At</span>
                <span className="font-semibold text-gray-900">
                  {new Date(order.paidAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Shipping Address
          </h3>
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-gray-900">
                {order.shippingName}
              </p>
              <p className="text-gray-600">{order.shippingPhone}</p>
              <p className="text-gray-600">{order.shippingAddress}</p>
              {(order.shippingCity || order.shippingArea) && (
                <p className="text-gray-600">
                  {[order.shippingArea, order.shippingCity]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
