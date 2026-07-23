"use client";

import Image from "next/image";
import Helper from "@/helper/helper";
import { CartItem } from "@/types/cart.types";
import { ShoppingBag } from "lucide-react";

type Props = {
  cart: CartItem[];
  subtotal: number;
  discount: number;
  onPlaceOrder: () => void;
  submitting: boolean;
};

const OrderSummary = ({
  cart,
  subtotal,
  discount,
  onPlaceOrder,
  submitting,
}: Props) => {
  const total = subtotal;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
      <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

      <div className="space-y-3 max-h-64 overflow-y-auto mb-5">
        {cart.map((item: CartItem) => {
          const ep =
            item.discountPrice && item.discountPrice > 0 && item.discountPrice < item.price
              ? item.discountPrice
              : item.price;
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className="relative w-14 h-14 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                <Image
                  src={Helper.getImage(item.thumbnail)}
                  alt={item.slug}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {item.name}
                </p>
                {item.attributes && item.attributes.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {item.attributes.map((a) => a.value).join(" / ")}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {item.discountPrice && item.discountPrice > 0 && item.discountPrice < item.price ? (
                    <>
                      <span className="text-xs text-gray-400 line-through">
                        {item.price} TK
                      </span>
                      <span className="text-sm font-bold text-red-600">
                        {ep} TK
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-gray-900">
                      {item.price} TK
                    </span>
                  )}
                  <span className="text-xs text-gray-500">x{item.quantity}</span>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                {ep * item.quantity} TK
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-semibold text-gray-900">{subtotal} TK</span>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Discount</span>
            <span className="font-semibold text-green-600">-{discount} TK</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Shipping</span>
          <span className="font-semibold text-green-600">Free</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
          <span className="text-base font-bold text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">{total} TK</span>
        </div>
      </div>

      <button
        onClick={onPlaceOrder}
        disabled={submitting}
        className="block w-full text-center global_button text-base py-3 disabled:opacity-50"
      >
        <span className="flex items-center justify-center gap-2">
          <ShoppingBag size={18} />
          {submitting ? "Placing Order..." : "Place Order"}
        </span>
      </button>
    </div>
  );
};

export default OrderSummary;
