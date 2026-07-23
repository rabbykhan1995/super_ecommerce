"use client";

import { cartStore } from "@/zustand/cart.store";
import { CartItem } from "@/types/cart.types";
import Image from "next/image";
import Link from "next/link";
import Helper from "@/helper/helper";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";

const CartPage = () => {
  const {
    cart,
    totalCartItems,
    cartTotal,
    isFetching,
    updateItem,
    removeItem,
    clearCart,
  } = cartStore();

  const increment = (item: CartItem) => {
    const newQty = item.quantity + 1;
    if (item.stock && newQty > item.stock) return;
    updateItem(item.id, { quantity: newQty });
  };

  const decrement = (item: CartItem) => {
    const newQty = item.quantity - 1;
    if (newQty < 1) return;
    updateItem(item.id, { quantity: newQty });
  };

  const formatAttributes = (attrs: { name: string; value: string }[]) => {
    if (!attrs || attrs.length === 0) return null;
    return attrs.map((a) => `${a.name}: ${a.value}`).join(", ");
  };

  // Loading skeleton
  if (isFetching && cart.length === 0) {
    return (
      <div className="container_custom py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 bg-gray-100 rounded-xl">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-64 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (cart.length === 0) {
    return (
      <div className="container_custom py-16">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart size={40} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h1>
          <p className="text-gray-500 mb-8">
            Looks like you haven&apos;t added any items to your cart yet.
          </p>
          <Link
            href="/products"
            className="global_button flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container_custom py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Shopping Cart
          <span className="text-base font-normal text-gray-500 ml-2">
            ({totalCartItems} {totalCartItems === 1 ? "item" : "items"})
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items - Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item: CartItem) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <Link
                href={`/product/${item.slug}`}
                className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden"
              >
                <Image
                  src={Helper.getImage(item.thumbnail)}
                  alt={item.slug}
                  fill
                  className="object-contain p-2"
                />
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.slug}`}
                  className="text-sm sm:text-base font-semibold text-gray-900 hover:underline truncate block"
                >
                  {item.name}
                </Link>

                {item.attributes && item.attributes.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatAttributes(item.attributes)}
                  </p>
                )}

                <p className="text-base sm:text-lg font-bold text-gray-900 mt-2">
                  {item.discountPrice && item.discountPrice > 0 && item.discountPrice < item.price ? (
                    <span className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 line-through font-normal">
                        {item.price} TK
                      </span>
                      <span className="text-red-600">{item.discountPrice} TK</span>
                    </span>
                  ) : (
                    <>{item.price} TK</>
                  )}
                </p>

                {/* Quantity Controls - Mobile */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => decrement(item)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 text-sm font-semibold min-w-[40px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increment(item)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <span className="text-sm sm:text-base font-bold text-gray-900">
                      {(item.discountPrice && item.discountPrice > 0 && item.discountPrice < item.price
                        ? item.discountPrice
                        : item.price) * item.quantity} TK
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary - Right Column */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal ({totalCartItems} items)</span>
                <span className="font-semibold text-gray-900">{cartTotal} TK</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">{cartTotal} TK</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center global_button text-base py-3"
            >
              <span className="flex items-center justify-center gap-2">
                <ShoppingBag size={18} />
                Proceed to Checkout
              </span>
            </Link>

            <Link
              href="/products"
              className="block w-full text-center mt-3 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-lg font-bold text-gray-900">{cartTotal} TK</span>
        </div>
        <Link
          href="/checkout"
          className="block w-full text-center global_button py-3"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default CartPage;
