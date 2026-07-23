"use client";

import type { EcomOrder, OrderStatus } from "@/types/order.types";
import Image from "next/image";
import Helper from "@/helper/helper";
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  XCircle,
  CreditCard,
  Banknote,
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

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={16} />,
  confirmed: <CheckCircle2 size={16} />,
  processing: <Package size={16} />,
  shipped: <Truck size={16} />,
  delivered: <CheckCircle2 size={16} />,
  cancelled: <XCircle size={16} />,
  failed: <XCircle size={16} />,
  hold: <Clock size={16} />,
};

type Props = {
  order: EcomOrder;
};

const OrderTracker = ({ order }: Props) => {
  const currentIndex = STATUS_FLOW.indexOf(order.status as OrderStatus);

  const isTerminal = ["cancelled", "failed"].includes(order.status);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="text-lg font-bold text-gray-900">{order.orderNo}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Status</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 capitalize">
                {STATUS_ICONS[order.status]}
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span>
            Payment:{" "}
            <span className="font-semibold text-gray-700 capitalize">
              {order.paymentMethod === "stripe"
                ? `Paid (${order.paymentMethod})`
                : order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : order.paymentMethod || "N/A"}
            </span>
          </span>
          <span>|</span>
          <span>
            Placed:{" "}
            <span className="font-semibold text-gray-700">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </span>
        </div>

        {/* Status Timeline */}
        {isTerminal ? (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl ${
              order.status === "cancelled"
                ? "bg-red-50 text-red-700"
                : "bg-orange-50 text-orange-700"
            }`}
          >
            {STATUS_ICONS[order.status]}
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
      </div>

      {/* Items */}
      {order.items && order.items.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Items</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
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
                    {item.discountPrice && item.discountPrice > 0 && item.discountPrice < item.salePrice
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
      )}

      {/* Shipping Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          Shipping To
        </h3>
        <div className="flex items-start gap-3">
          <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {order.shippingName}
            </p>
            <p className="text-sm text-gray-600">{order.shippingPhone}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress}</p>
            {(order.shippingCity || order.shippingArea) && (
              <p className="text-sm text-gray-600">
                {[order.shippingArea, order.shippingCity]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracker;
