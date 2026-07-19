"use client";

import { useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import ProductCard from "../Cards/ProductCard";
import ProductCardSkeleton from "../Skeletons/ProductCardSkeleton";
import CountdownTimer from "../CountdownTimer";
import type { EcomProduct } from "@/types/product.types";
import Link from "next/link";

interface FlashSaleProductSliderProps {
  products: EcomProduct[];
  endDate?: string;
  loading?: boolean;
}

const SKELETON_COUNT = 6;

const FlashSaleProductSlider = ({
  products,
  endDate,
  loading = false,
}: FlashSaleProductSliderProps) => {
  const [isExpired, setIsExpired] = useState(false);

  const handleCountdownComplete = useCallback(() => {
    setIsExpired(true);
  }, []);

  if (loading) {
    return (
      <div className="w-full font-medium lg:py-2 pt-6 border border-gray-200 px-2">
        <div className="flex items-center justify-between mb-10 px-1">
          <div className="flex items-center gap-3">
            <div className="shimmer h-6 w-32 rounded bg-gray-200" />
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="shimmer h-6 w-7 rounded-md bg-gray-200" />
              ))}
            </div>
          </div>
          <div className="shimmer h-4 w-16 rounded bg-gray-200" />
        </div>

        <div className="flex gap-4 overflow-hidden px-5">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="min-w-[150px] flex-shrink-0">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>

        <style jsx global>{`
          .shimmer {
            background: linear-gradient(
              90deg,
              #f0f0f0 25%,
              #e0e0e0 37%,
              #f0f0f0 63%
            );
            background-size: 400% 100%;
            animation: shimmer 1.4s ease infinite;
          }

          @keyframes shimmer {
            0% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}</style>
      </div>
    );
  }

  if (isExpired) {
    return null;
  }

  if (!products.length) {
    return (
      <div className="w-full font-medium lg:py-2 pt-6 border border-gray-200 px-2">
        <div className="flex items-center gap-3 mb-4 px-1">
          <h1 className="text-xl font-bold text-[#F7311E]">⚡ Flash Sale</h1>
        </div>
        <p className="text-gray-400 text-sm text-center py-10">No flash sale products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="w-full font-medium lg:py-2 pt-6 border border-gray-200 px-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-10 px-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#F7311E]">⚡ Flash Sale</h1>
          {endDate && (
            <CountdownTimer endDate={endDate} onComplete={handleCountdownComplete} />
          )}
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
