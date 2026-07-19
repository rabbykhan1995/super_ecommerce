import Link from "next/link";
import ProductCard from "../Cards/ProductCard";
import { Star } from "lucide-react";
import type { EcomProduct } from "@/types/product.types";

interface FeaturedProductsProps {
  products: EcomProduct[];
}

const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
  if (!products.length) {
    return null;
  }

  return (
    <div className="p-2 border border-gray-200 mb-10">
      <h1 className="py-4 flex w-fit items-center gap-2">
        <Star size={18} className="text-yellow-400 fill-yellow-400" /> Featured Products
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <h1 className="w-full flex justify-center my-5">
        <Link
          href="/products?featured=true"
          className="text-[13px] text-[#F7311E] font-semibold cursor-pointer hover:underline"
        >
          See All Featured Products →
        </Link>
      </h1>
    </div>
  );
};

export default FeaturedProducts;
