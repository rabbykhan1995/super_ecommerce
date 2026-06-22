import api from "@/utils/apiconfig";
import { create } from "zustand";
import { Cart } from "@/types/cart.types";

type CartStore = {
  cart: Cart[];
  totalCartItems:number;
  openCartSlider:boolean;
  isLoading: boolean;
  setCart: (cart: Cart[]) => void;
  setOpenCartSlider:(val:boolean)=>void;
  fetchCart: () => Promise<void>;
};


export const cartStore = create<CartStore>((set) => ({
  cart: [],
  totalCartItems:0,
  isLoading: false,
  openCartSlider:false,

  setCart: (cart:Cart[] | []) => set({ cart }),
  setOpenCartSlider:(val:boolean)=>set({openCartSlider:val}),
  fetchCart: async () => {
    try {
      set({ isLoading: true });

      const res = await api(`/cart/list`);

      if (!res.data.success === true) {
        set({ cart: [], isLoading: false });
        return;
      }


      console.log(res.data.data)
      set({
        cart: res.data.data.items,
        totalCartItems:res.data.data.totalItems,
        isLoading: false,
      });
    } catch (error) {
      set({ cart: [], isLoading: false });
    }
  },
}));
