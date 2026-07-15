"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import ProductCard from "../Cards/ProductCard";
import type { EcomProduct } from "@/types/product.types";
import Link from "next/link";

interface FlashSaleProductSliderProps {
  products: EcomProduct[];
}

const FlashSaleProductSlider = ({ products }: FlashSaleProductSliderProps) => {
  if (!products.length) return null;

  return (
    <div className="w-full font-medium lg:py-2 pt-6 border border-gray-200 px-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-10 px-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#F7311E]">⚡ Flash Sale</h1>
          <div className="flex items-center gap-1 text-[12px]">
            {["02", "14", "36"].map((val, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="text-white bg-[#F7311E] py-[3px] px-[7px] rounded-md font-mono">
                  {val}
                </span>
                {idx < 2 && <span className="text-gray-400">:</span>}
              </div>
            ))}
          </div>
        </div>
        <Link
          href="/products?sort=latest"
          className="text-[13px] text-[#F7311E] font-semibold cursor-pointer hover:underline"
        >
          See All →
        </Link>
      </div>

      <Swiper
        modules={[Pagination, Autoplay, Navigation]}
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          480: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 6 },
        }}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="relative w-full p-5"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FlashSaleProductSlider;
