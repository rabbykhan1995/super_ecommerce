"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cartStore } from "@/zustand/cart.store";
import { CartItem } from "@/types/cart.types";
import Helper from "@/helper/helper";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";

const MyCartPage = () => {
  const {
    cart,
    totalCartItems,
    cartTotal,
    isFetching,
    isRemoving,
    isClearing,
    fetchCart,
    updateItem,
    removeItem,
    clearCart,
  } = cartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

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

  if (isFetching && cart.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">My Cart</h1>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse flex gap-4 p-4 bg-white rounded-2xl border border-gray-100"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-xl" />
              <div className="flex-1 space-y-2.5">
                <div className="h-3.5 w-40 bg-gray-100 rounded-lg" />
                <div className="h-3 w-24 bg-gray-100 rounded-lg" />
                <div className="h-4 w-16 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">My Cart</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
            <ShoppingCart size={30} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1.5">
            Your cart is empty
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">
            Looks like you haven't added anything yet. Browse our collection and
            find something you love.
          </p>
          <Link
            href="/products"
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm shadow-orange-500/20"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Cart</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {totalCartItems} {totalCartItems === 1 ? "item" : "items"} waiting
            for checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          disabled={isClearing}
          className="text-xs font-semibold text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
        >
          {isClearing ? "Clearing..." : "Clear All"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item: CartItem) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:shadow-gray-100/50 transition-all duration-300"
            >
              {/* Image */}
              <Link
                href={`/product/${item.slug}`}
                className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden ring-1 ring-gray-100"
              >
                <Image
                  src={Helper.getImage(item.thumbnail)}
                  alt={item.slug}
                  fill
                  className="object-contain p-2"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.slug}`}
                  className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors line-clamp-1"
                >
                  {item.name}
                </Link>

                {item.attributes && item.attributes.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatAttributes(item.attributes)}
                  </p>
                )}

                <p className="text-sm font-bold text-gray-900 mt-1.5">
                  {item.discountPrice &&
                  item.discountPrice > 0 &&
                  item.discountPrice < item.price ? (
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-gray-300 line-through font-normal">
                        {item.price} TK
                      </span>
                      <span className="text-red-500">
                        {item.discountPrice} TK
                      </span>
                    </span>
                  ) : (
                    <>{item.price} TK</>
                  )}
                </p>

                {/* Quantity + Total */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => decrement(item)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold text-gray-700">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increment(item)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isRemoving}
                      className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                    <span className="text-sm font-bold text-gray-900 min-w-[70px] text-right">
                      {(item.discountPrice &&
                      item.discountPrice > 0 &&
                      item.discountPrice < item.price
                        ? item.discountPrice
                        : item.price) * item.quantity}{" "}
                      TK
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-5">
              Order Summary
            </h2>

            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  Subtotal ({totalCartItems} items)
                </span>
                <span className="font-semibold text-gray-700">
                  {cartTotal} TK
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Shipping</span>
                <span className="font-semibold text-emerald-500">Free</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {cartTotal} TK
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm shadow-orange-500/20"
            >
              <span className="flex items-center justify-center gap-2">
                <ShoppingBag size={16} />
                Proceed to Checkout
              </span>
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center gap-1.5 mt-3 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={14} />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCartPage;
