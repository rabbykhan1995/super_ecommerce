import { EcomProduct } from "@/types/product.types";
import { create } from "zustand";

interface OpenCloseState {
    variantModalOpen: boolean;
      mobileCheckoutModalOpen: boolean;
    updateProfileModalOpen: boolean;
    variantModalProduct: EcomProduct | null;
    setVariantModalOpen: (value: boolean) => void;
    setVariantModalProduct: (value: EcomProduct) => void;
    setMobileCheckoutModalOpen: (value: boolean) => void;
    setUpdateProfileModalOpen: (value: boolean) => void;
}

const useOpenCloseState = create<OpenCloseState>((set) => ({
    variantModalProduct: null,
    variantModalOpen: false,
    mobileCheckoutModalOpen:false,
    updateProfileModalOpen: false,
    setVariantModalOpen: (value) => set({ variantModalOpen: value }),
    setVariantModalProduct: (value) => set({ variantModalProduct: value }),
    setMobileCheckoutModalOpen: (value) => set({ mobileCheckoutModalOpen: value }),
    setUpdateProfileModalOpen: (value) => set({ updateProfileModalOpen: value })
}));

export default useOpenCloseState;