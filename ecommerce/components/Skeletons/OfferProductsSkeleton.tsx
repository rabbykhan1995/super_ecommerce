"use client";

import ProductCardSkeleton from "./ProductCardSkeleton";

const SKELETON_COUNT = 5;

const OfferProductsSkeleton = () => {
  return (
    <div className="p-2 border border-gray-200">
      {/* Header shimmer */}
      <div className="py-4 flex items-center gap-2">
        <div className="shimmer h-5 w-5 rounded bg-gray-200" />
        <div className="shimmer h-5 w-20 rounded bg-gray-200" />
      </div>

      {/* Product grid shimmer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>

      {/* Link shimmer */}
      <div className="flex justify-center my-5">
        <div className="shimmer h-4 w-40 rounded bg-gray-200" />
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

export default OfferProductsSkeleton;
