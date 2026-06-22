"use client";
import Link from "next/link";
import { X, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cartStore } from "@/zustand/cart.store";
import { Cart } from "@/types/cart.types";
import Image from "next/image";
import Helper from "@/helper/helper";
import api from "@/utils/apiconfig";
import { UpdateCart } from "@/types/cart.types";
import { useEffect } from "react";

const CartSlider = () => {
  const { openCartSlider, setOpenCartSlider, cart, totalCartItems, fetchCart } = cartStore();



  const removeFromCart = async (id: string) => {
    const res = await api.delete(`/cart/delete/${id}`);
    if (res.data.success === true) {
      await fetchCart();
      return;
    }
    return;
  }

  const increment = (item: Cart) => {
    const newQty = item.quantity + 1;
    updateCartQuantity(item, newQty);
  };

  const decrement = (item: Cart) => {
    const newQty = item.quantity - 1;
    updateCartQuantity(item, newQty);
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
    }
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
      {/* Mobile Menu Button */}
      {!!openCartSlider && (
        <div className="fixed top-5 right-5 z-[100]">
          <button
            onClick={() => setOpenCartSlider(false)}
            className="p-1 bg-[#2b2a2a] text-white rounded-full shadow-lg"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Mobile Slider Overlay */}
      <AnimatePresence>
        {openCartSlider && (
          <>
            {/* Background Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenCartSlider(false)}
              className="fixed inset-0 bg-black/10 z-[80]"
            />
            {/* Slider Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-[70vw] lg:w-[40vw] bg-white shadow-lg z-[90] p-5 flex flex-col gap-4"
            >
              <h2 className="text-xl flex items-center gap-2 font-bold">
                {" "}
                <ShoppingBag size={20} color="#242424" />
                <span> Cart ({totalCartItems})</span>
              </h2>
              {/* Dummy content */}
              <div className="flex flex-col gap-4">
                {cart.map((item: Cart) => {
                  return (
                    <div className="flex items-start">
                      <div className="relative w-1/4 h-full">
                        <Image src={Helper.getImage(item.thumbnail || null)} fill className="object-contain" alt={item.itemSlug} />
                      </div>
                      <div className="w-2/4">
                        <h1 className="text-lg font-[500] uppercase">{item.itemTitle}</h1>
                        <div className="flex items-center gap-3">
                          {/* Quantity Control */}
                          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">

                            <button
                              onClick={() => decrement(item)}
                              className="px-3 py-1 hover:bg-gray-100"
                            >
                              -
                            </button>

                            <span className="px-4 text-sm">{item.quantity}</span>

                            <button
                              onClick={() => increment(item)}
                              className="px-3 py-1 hover:bg-gray-100"
                            >
                              +
                            </button>

                          </div>
                          <button onClick={() => removeFromCart(item._id as string)} className="underline text-gray-500 text-sm cursor-pointer">remove</button>
                        </div>
                      </div>
                      <h1 className="w-1/4 flex justify-end">{item.price * item.quantity}TK</h1>
                    </div>

                  )
                })}


              </div>

              <Link
                href="/checkout"
                className="mt-auto global_button text-center"
                onClick={() => setOpenCartSlider(false)}
              >
                Checkout
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartSlider;
