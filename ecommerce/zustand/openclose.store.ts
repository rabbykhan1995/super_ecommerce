import { EcomProduct } from "@/types/product.types";
import { create } from "zustand";

interface OpenCloseState {
    variantModalOpen: boolean;
    variantModalProduct: EcomProduct | null;
    setVariantModalOpen: (value: boolean) => void;
    setVariantModalProduct: (value: EcomProduct) => void;

}

const useOpenCloseState = create<OpenCloseState>((set) => ({
    variantModalProduct: null,
    variantModalOpen: false,
    setVariantModalOpen: (value) => set({ variantModalOpen: value }),
    setVariantModalProduct: (value) => set({ variantModalProduct: value })
}));

export default useOpenCloseState;