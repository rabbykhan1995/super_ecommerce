"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { confirmStripeOrder } from "@/utils/checkoutApi";
import type { EcomOrder } from "@/types/order.types";
import { CheckCircle, Package, Truck } from "lucide-react";
import { cartStore } from "@/zustand/cart.store";

const OrderSuccessPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderNo = searchParams.get("orderNo");
  const [order, setOrder] = useState<EcomOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (sessionId) {
          const data = await confirmStripeOrder(sessionId);
          setOrder(data);
        } else if (orderNo) {
          setOrder({
            orderNo,
            status: "confirmed",
            paymentMethod: "cod",
            paymentStatus: "unpaid",
            totalAmount: 0,
          } as EcomOrder);
        }
        cartStore.getState().fetchCart();
      } catch {
        setError("Could not load order details.");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId || orderNo) {
      fetchOrder();
    } else {
      setLoading(false);
      setError("No order information found.");
    }
  }, [sessionId, orderNo]);

  if (loading) {
    return (
      <div className="container_custom py-16 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container_custom py-16 text-center">
        <p className="text-gray-500 mb-4">{error || "Order not found."}</p>
        <Link href="/products" className="global_button inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container_custom py-16">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-500 mb-8">
          Thank you for your order. We&apos;ll process it right away.
        </p>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 text-left">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Order No</span>
              <span className="text-sm font-bold text-gray-900">
                {order.orderNo}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <span className="text-sm font-semibold text-blue-600 capitalize">
                {order.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Payment</span>
              <span className="text-sm font-semibold capitalize">
                {order.paymentMethod === "stripe"
                  ? "Paid (Stripe)"
                  : "Cash on Delivery"}
              </span>
            </div>
            {order.totalAmount > 0 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  {order.totalAmount} TK
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/track-order?orderNo=${order.orderNo}`}
            className="global_button flex items-center justify-center gap-2"
          >
            <Truck size={18} />
            Track Order
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Package size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
