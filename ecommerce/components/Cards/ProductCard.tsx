"use client";
import Helper from "@/helper/helper";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ProductCardProps {
  title: string;
  thumbnail?: string | null;
  slug: string;
}

const ProductCard = ({
  title,

  thumbnail,
  slug,
}: ProductCardProps) => {
  return (
    <div className="group bg-white rounded-xl overflow-hidden">
      {/* 1. Thumbnail Section */}
      <div className="relative h-60 overflow-hidden bg-slate-100">
        
          <Image
            src={Helper.getImage(thumbnail??null)}
            alt={title}
            fill
            className="object-fill group-hover:scale-105 transition-transform duration-500 "
          />
      
      </div>

      {/* 2. Content Section */}
      <div className="p-4 space-y-2">
        {/* Title */}
        <Link
          href={`/product/${slug}`}
          className="font-bold text-slate-800 text-lg line-clamp-2"
        >
          {title}
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
