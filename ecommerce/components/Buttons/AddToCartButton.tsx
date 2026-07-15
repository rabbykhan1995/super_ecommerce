"use client";

import React, { useState } from "react";
import { FullProduct, ProductVariant } from "@/types/product.types";
import { cartStore } from "@/zustand/cart.store";
import { X, ShoppingBag, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Helper from "@/helper/helper";

type Props = {
  product: FullProduct;
};

const AddToCartButton = ({ product }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem, isAdding, setOpenCartSlider } = cartStore();

  const increment = () => {
    if (selectedVariant && selectedVariant.stock && quantity >= selectedVariant.stock) return;
    setQuantity((prev) => prev + 1);
  };

  const decrement = () => {
    if (quantity <= 1) return;
    setQuantity((prev) => prev - 1);
  };

  const handleOpenModal = () => {
    if (product.variants.length === 1) {
      setSelectedVariant(product.variants[0]);
    }
    setQuantity(1);
    setIsOpen(true);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    const success = await addItem({
      productID: product.id,
      variantID: selectedVariant.id,
      quantity,
    });

    if (success) {
      setIsOpen(false);
      setSelectedVariant(null);
      setQuantity(1);
      setOpenCartSlider(true);
    }
  };

  const formatAttributes = (attrs: { name: string; value: string }[]) => {
    return attrs.map((a) => `${a.name}: ${a.value}`).join(", ");
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="global_button flex items-center gap-2"
      >
        <ShoppingBag size={18} />
        Add To Cart
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsOpen(false); setSelectedVariant(null); }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Select Variant</h3>
                  <button
                    onClick={() => { setIsOpen(false); setSelectedVariant(null); }}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  {product.thumbnail && (
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={Helper.getImage(product.thumbnail)}
                        alt={product.name}
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                    <p className="text-sm text-gray-500">
                      {product.salePrice > 0 ? `${product.salePrice} TK` : "Price varies by variant"}
                    </p>
                  </div>
                </div>

                {/* Variant List */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
                  {product.variants.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No variants available</p>
                  ) : (
                    product.variants.map((variant) => {
                      const outOfStock = variant.stock !== null && variant.stock <= 0;
                      const isSelected = selectedVariant?.id === variant.id;
                      return (
                        <button
                          key={variant.id}
                          disabled={outOfStock}
                          onClick={() => setSelectedVariant(variant)}
                          className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                            outOfStock
                              ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                              : isSelected
                                ? "border-gray-900 bg-gray-50"
                                : "border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {formatAttributes(variant.attributes)}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                {variant.salePrice !== null && variant.salePrice > 0 && (
                                  <span className="text-sm font-bold text-gray-900">
                                    {variant.salePrice} TK
                                  </span>
                                )}
                                <span className={`text-xs ${outOfStock ? "text-red-500" : "text-gray-500"}`}>
                                  {outOfStock ? "Out of stock" : `${variant.stock} in stock`}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex-shrink-0 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                                <Check size={14} className="text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer: Quantity + Add to Cart */}
                <div className="border-t border-gray-100 p-5">
                  {selectedVariant && !selectedVariant.stock ? (
                    <p className="text-center text-red-500 text-sm py-2">Selected variant is out of stock</p>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={decrement}
                          className="px-4 py-2.5 hover:bg-gray-100 text-lg font-medium transition-colors"
                        >
                          -
                        </button>
                        <span className="px-5 py-2.5 text-sm font-semibold min-w-[40px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={increment}
                          className="px-4 py-2.5 hover:bg-gray-100 text-lg font-medium transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={handleAddToCart}
                        disabled={!selectedVariant || isAdding}
                        className="flex-1 global_button flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAdding ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={16} />
                            Add To Cart
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddToCartButton;
