"use client";

import React, { useEffect, useState } from "react";
import api from "@/utils/apiconfig";
import { FullProduct } from "@/types/product.types";
import { Cart, CreateCart, UpdateCart } from "@/types/cart.types";
import { cartStore } from "@/zustand/cart.store";
type Props = {
  product: FullProduct
};

const AddToCartButton = ({
  product
}: Props) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { cart, fetchCart, setOpenCartSlider } = cartStore();
  const increment = () => {
    if (product.stock && quantity >= product.stock) return;
    setQuantity((prev) => prev + 1);
  };

  const decrement = () => {
    if (quantity <= 1) return;
    setQuantity((prev) => prev - 1);
  };

  const addToCart = async () => {

    const item: CreateCart = {
      itemID: product._id,
      itemSlug: product.slug,
      itemTitle: product.title,
      thumbnail: product.thumbnail || undefined,
      price: product.price,
      stock: product.stock,
      quantity,
    }
    const res = await api.post("/cart/create", item);
    if (res.data.success === true) {
      await fetchCart();
      setOpenCartSlider(true);
    }

  };

  const updateCartQuantity = async (item: Cart, newQty: number) => {

    if (newQty < 1) return;
    if (item.stock && newQty > item.stock) return;

    const payload: UpdateCart = {
      itemID: item.itemID,
      itemSlug: item.itemSlug,
      itemTitle: item.itemTitle,
      thumbnail: item.thumbnail,
      price: item.price,
      stock: item.stock,
      quantity: newQty,
    };

    const res = await api.put(`/cart/update/${item._id}`, payload);

    if (res.data.success) {
      await fetchCart();
      setOpenCartSlider(true);
    }
  };

  useEffect(() => {
    const item = fetchItemQuantityFromCart(product._id);
    if (item) {
      setQuantity(item.quantity);
    }
  }, [cart])

  const fetchItemQuantityFromCart = (productID: string): Cart | undefined => {
    const item: Cart | undefined = cart.find((i: Cart) => i.itemID === productID);
    return item;
  }

  const handleCartAction = async () => {
    const item = fetchItemQuantityFromCart(product._id);

    if (item) {
      await updateCartQuantity(item, quantity);
    } else {
      await addToCart();
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Quantity Control */}
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
        <button
          onClick={decrement}
          className="px-3 py-1 hover:bg-gray-100"
        >
          -
        </button>

        <span className="px-4 text-sm">{quantity}</span>

        <button
          onClick={increment}
          className="px-3 py-1 hover:bg-gray-100"
        >
          +
        </button>
      </div>

      {/* Add To Cart */}
      <button
        onClick={handleCartAction}
        disabled={loading}
        className="global_button"
      >
        {loading ? "Adding..." : "Add To Cart"}
      </button>
    </div>
  );
};

export default AddToCartButton;