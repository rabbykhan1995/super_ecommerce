"use client";

import ProductCardSkeleton from "./ProductCardSkeleton";

const SKELETON_COUNT = 6;

const FlashProductsSkeleton = () => {
  return (
    <div className="w-full font-medium lg:py-2 pt-6 border border-gray-200 px-2">
      {/* Header shimmer */}
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

      {/* Product cards shimmer */}
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
};

export default FlashProductsSkeleton;
