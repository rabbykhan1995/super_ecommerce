"use client";

import { cartStore } from "@/zustand/cart.store";
import { userStore } from "@/zustand/user.store";
import { useEffect } from "react";

const InitialStarter = () => {
  const fetchUser = userStore((s) => s.fetchUser);
  const fetchCart = cartStore((s) => s.fetchCart);

  useEffect(() => {
    (async () => {
      await Promise.all([fetchUser(), fetchCart()]);
    })();

    const handleWheel = (e: WheelEvent) => {
      const activeEl = document.activeElement as HTMLInputElement | null;
      if (activeEl && activeEl.type === "number") {
        activeEl.blur();
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return null;
};

export default InitialStarter;
