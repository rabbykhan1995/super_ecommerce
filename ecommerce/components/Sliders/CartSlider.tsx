"use client";
import Link from "next/link";
import { X, ShoppingBag, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cartStore } from "@/zustand/cart.store";
import { CartItem } from "@/types/cart.types";
import Image from "next/image";
import Helper from "@/helper/helper";
import { useEffect } from "react";

const CartSlider = () => {
  const {
    openCartSlider,
    setOpenCartSlider,
    cart,
    totalCartItems,
    cartTotal,
    fetchCart,
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
    return attrs.map((a) => `${a.value}`).join(" / ");
  };

  useEffect(() => {
    if (openCartSlider) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [openCartSlider]);

  return (
    <>
      <AnimatePresence>
        {openCartSlider && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenCartSlider(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
            />

            {/* Slider Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-[90] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag size={20} className="text-gray-900" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Cart ({totalCartItems})
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setOpenCartSlider(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ShoppingCart size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Your cart is empty
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Add some items to get started
                    </p>
                    <button
                      onClick={() => setOpenCartSlider(false)}
                      className="global_button"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {cart.map((item: CartItem) => (
                      <div key={item.id} className="flex items-start gap-3 p-4">
                        {/* Image */}
                        <div className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                          <Image
                            src={Helper.getImage(item.thumbnail)}
                            alt={item.slug}
                            fill
                            className="object-contain p-1"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {item.name}
                          </h4>
                          {item.attributes && item.attributes.length > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatAttributes(item.attributes)}
                            </p>
                          )}
                          <p className="text-sm font-bold text-gray-900 mt-1">
                            {item.price} TK
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => decrement(item)}
                                className="p-1.5 hover:bg-gray-100 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-3 text-sm font-semibold min-w-[36px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => increment(item)}
                                className="p-1.5 hover:bg-gray-100 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Line Total */}
                        <div className="text-sm font-bold text-gray-900 flex-shrink-0">
                          {item.price * item.quantity} TK
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className="border-t border-gray-100 p-5 space-y-3">
                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">{cartTotal} TK</span>
                  </div>

                  {/* Actions */}
                  <Link
                    href="/cart"
                    className="block w-full text-center py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setOpenCartSlider(false)}
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/cart"
                    className="block w-full text-center global_button"
                    onClick={() => setOpenCartSlider(false)}
                  >
                    Checkout
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartSlider;
