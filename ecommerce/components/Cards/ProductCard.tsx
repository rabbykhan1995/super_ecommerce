"use client";
import Helper from "@/helper/helper";
import { CarTaxiFront, ShoppingBag, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import OfferLogo from "../Logos/OfferLogo";

interface ProductCardProps {
  item: {
    id: number;
    name: string;
    image: string;
    price: number;
    oldPrice: number;
    discount: number;
    rating: number;
    sold: number;
    isOffer?:boolean;
  };
}

const ProductCard = ({ item }: ProductCardProps) => {
    const { isOffer = false } = item;
  return (
    <div className="Product_Card relative flex flex-col justify-between bg-white rounded-md max-w-[450px] border border-gray-200 hover:border-amber-600">
      {/* Top */}

        {item.discount > 0 ? (
          isOffer?<div className="absolute top-1 left-1"><OfferLogo percent={item.discount} /></div>:
          <div className="bg-[#F7311E] text-white text-[11px] absolute top-0 left-0 font-bold px-2 py-[2px] z-10">
            -{item.discount}%
          </div>
        ) : (
          <div />
        )}

        <div className="absolute right-0 top-0 bg-green-500 text-white text-[11px] px-2 py-[2px] z-10">
          Sold: {item.sold}
        </div>


      {/* Image */}
      <div className="relative w-full h-full aspect-square cursor-pointer overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
        />

        {/* Hover Cart Button */}
        <button className="absolute top-2 right-2 bg-white shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <ShoppingCart size={16} className="text-[#F7311E]" />
        </button>
      </div>

      {/* Product Name */}
      <h2 className="text-center text-zinc-600 text-sm leading-snug h-12 overflow-hidden">
        {item.name}
      </h2>

      {/* Price + Button */}
      <div className="flex justify-between items-center mt-1 px-1">
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-sm font-semibold">
            ${item.price.toFixed(2)}
          </span>

          <del className="text-xs text-gray-400">
            ${item.oldPrice.toFixed(2)}
          </del>
        </div>

        <button className="px-3 py-1 text-xs rounded-md bg-[#F7311E] text-white hover:bg-[#df2815] transition">
          <ShoppingBag size={18}/>
        </button>
      </div>

      {/* Rating */}
      <div className="flex items-center justify-center gap-1 mt-2">
        <Star
          size={14}
          className="fill-yellow-400 text-yellow-400"
        />
        <span className="text-xs text-gray-500">{item.rating}</span>
      </div>
    </div>
  );
};

export default ProductCard;
