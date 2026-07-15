"use client";
import Helper from "@/helper/helper";
import { ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { EcomProduct } from "@/types/product.types";

interface ProductCardProps {
  product: EcomProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const imageSrc = Helper.getImage(product.thumbnail);
  const inStock = product.stock > 0;

  return (
    <div className="Product_Card relative flex flex-col justify-between bg-white rounded-md max-w-[450px] border border-gray-200 hover:border-amber-600">
      {product.featured && (
        <div className="bg-[#F7311E] text-white text-[11px] absolute top-0 left-0 font-bold px-2 py-[2px] z-10">
          Featured
        </div>
      )}

      <div className="absolute right-0 top-0 bg-green-500 text-white text-[11px] px-2 py-[2px] z-10">
        Sold: {product.totalSold}
      </div>

      <Link href={`/product/${product.slug}`} className="relative w-full h-full aspect-square cursor-pointer overflow-hidden">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover"
        />
      </Link>

      <h2 className="text-center text-zinc-600 text-sm leading-snug h-12 overflow-hidden px-1 mt-1">
        {product.name}
      </h2>

      <div className="flex justify-between items-center mt-1 px-1">
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-sm font-semibold">
            ${product.salePrice.toFixed(2)}
          </span>
        </div>

        <button
          disabled={!inStock}
          className="px-3 py-1 text-xs rounded-md bg-[#F7311E] text-white hover:bg-[#df2815] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag size={18} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-1 mt-2 pb-2">
        <Star
          size={14}
          className="fill-yellow-400 text-yellow-400"
        />
        <span className="text-xs text-gray-500">
          {product.averageRating.toFixed(1)} ({product.totalReviews})
        </span>
      </div>
    </div>
  );
};

export default ProductCard;
