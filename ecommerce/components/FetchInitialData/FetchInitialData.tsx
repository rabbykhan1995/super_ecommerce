"use client";

import api from "@/utils/apiconfig";
import { cartStore } from "@/zustand/cart.store";
import { userStore } from "@/zustand/user.store";
import { useEffect, useState } from "react";

const FetchInitialData = () => {

  const { fetchUser, user } = userStore();
  const { fetchCart } = cartStore();

  useEffect(() => {
    (async () => {
      Promise.all([fetchUser(), fetchCart()]);
    })();

    const handleWheel = (e: WheelEvent) => {
      const activeEl = document.activeElement as HTMLInputElement | null;

      // check if the active element is a number input
      if (activeEl && activeEl.type === "number") {
        activeEl.blur(); // remove focus to prevent scroll change
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);



  return null;
};

export default FetchInitialData;
