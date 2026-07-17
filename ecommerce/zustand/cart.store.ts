import api from "@/utils/apiconfig";
import Helper from "@/helper/helper";
import { create } from "zustand";
import { CartItem, AddToCartPayload, UpdateCartPayload } from "@/types/cart.types";

type CartStore = {
  cart: CartItem[];
  totalCartItems: number;
  cartTotal: number;
  openCartSlider: boolean;
  isFetching: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  isClearing: boolean;
  fetchCart: () => Promise<void>;
  addItem: (payload: AddToCartPayload) => Promise<boolean>;
  updateItem: (cartItemID: number, payload: UpdateCartPayload) => Promise<boolean>;
  removeItem: (cartItemID: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  setOpenCartSlider: (val: boolean) => void;
};

export const cartStore = create<CartStore>((set, get) => ({
  cart: [],
  totalCartItems: 0,
  cartTotal: 0,
  openCartSlider: false,
  isFetching: false,
  isAdding: false,
  isUpdating: false,
  isRemoving: false,
  isClearing: false,

  setOpenCartSlider: (val: boolean) => set({ openCartSlider: val }),

  fetchCart: async () => {
    try {
      const token = Helper.getToken();
      if (!token) {
        set({ cart: [], totalCartItems: 0, cartTotal: 0, isFetching: false });
        return;
      }

      set({ isFetching: true });
      const res = await api("/cart/list");

      if (res.data.success !== true) {
        set({ cart: [], totalCartItems: 0, cartTotal: 0, isFetching: false });
        return;
      }

      const items: CartItem[] = res.data.data;
      const totalCartItems = items.reduce((sum, item) => sum + 1, 0);
      const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      set({
        cart: items,
        totalCartItems,
        cartTotal,
        isFetching: false,
      });
    } catch {
      set({ cart: [], totalCartItems: 0, cartTotal: 0, isFetching: false });
    }
  },

  addItem: async (payload: AddToCartPayload) => {
    try {
      set({ isAdding: true });
      const res = await api.post("/cart/add", payload);
      if (res.data.success === true) {
        await get().fetchCart();
        set({ isAdding: false });
        return true;
      }
      set({ isAdding: false });
      return false;
    } catch {
      set({ isAdding: false });
      return false;
    }
  },

  updateItem: async (cartItemID: number, payload: UpdateCartPayload) => {
    try {
      set({ isUpdating: true });
      const res = await api.put(`/cart/update/${cartItemID}`, payload);
      if (res.data.success === true) {
        await get().fetchCart();
        set({ isUpdating: false });
        return true;
      }
      set({ isUpdating: false });
      return false;
    } catch {
      set({ isUpdating: false });
      return false;
    }
  },

  removeItem: async (cartItemID: number) => {
    try {
      set({ isRemoving: true });
      const res = await api.delete(`/cart/remove/${cartItemID}`);
      if (res.data.success === true) {
        await get().fetchCart();
        set({ isRemoving: false });
        return true;
      }
      set({ isRemoving: false });
      return false;
    } catch {
      set({ isRemoving: false });
      return false;
    }
  },

  clearCart: async () => {
    try {
      set({ isClearing: true });
      const res = await api.delete("/cart/clear");
      if (res.data.success === true) {
        set({ cart: [], totalCartItems: 0, cartTotal: 0, isClearing: false });
        return true;
      }
      set({ isClearing: false });
      return false;
    } catch {
      set({ isClearing: false });
      return false;
    }
  },
}));
