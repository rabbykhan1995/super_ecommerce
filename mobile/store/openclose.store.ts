import { EcomProduct } from "../types/product.types";
import { create } from "zustand";

interface OpenCloseState {
  variantModalOpen: boolean;
  variantModalProduct: EcomProduct | null;
  openMenuSlider: boolean;
  openCartSlider: boolean;
  setVariantModalOpen: (value: boolean) => void;
  setVariantModalProduct: (value: EcomProduct) => void;
  setOpenMenuSlider: (value: boolean) => void;
  setOpenCartSlider: (value: boolean) => void;
}

const useOpenCloseState = create<OpenCloseState>((set) => ({
  variantModalProduct: null,
  variantModalOpen: false,
  openMenuSlider: false,
  openCartSlider: false,
  setVariantModalOpen: (value) => set({ variantModalOpen: value }),
  setVariantModalProduct: (value) => set({ variantModalProduct: value }),
  setOpenMenuSlider: (value) => set({ openMenuSlider: value }),
  setOpenCartSlider: (value) => set({ openCartSlider: value }),
}));

export default useOpenCloseState;
