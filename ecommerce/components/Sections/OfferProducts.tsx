"use client";
import Link from "next/link";
import ProductCard from "../Cards/ProductCard";
import OfferLogo from "../Logos/OfferLogo";
import type { EcomProduct } from "@/types/product.types";

interface OfferProductsProps {
  products: EcomProduct[];
}

const OfferProducts = ({ products }: OfferProductsProps) => {
  if (!products.length) {
    return (
      <div className="p-2 border border-gray-200">
        <h1 className="py-4 flex w-fit">
          <OfferLogo label="%" /> Offers
        </h1>
        <p className="text-gray-400 text-sm text-center py-10">No offer products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="p-2 border border-gray-200">
      <h1 className="py-4 flex w-fit">
        <OfferLogo label="%" /> Offers
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <h1 className="w-full flex justify-center my-5">
        <Link
          href="/products?sort=bestSelling"
          className="text-[13px] text-[#F7311E] font-semibold cursor-pointer hover:underline"
        >
          See All Offer Products →
        </Link>
      </h1>
    </div>
  );
};

export default OfferProducts;
