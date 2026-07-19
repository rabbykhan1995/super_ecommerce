"use client";

const ProductCardSkeleton = () => {
  return (
    <div className="flex text-center flex-col gap-1 col-span-1 rounded-md shadow-md max-w-[400px] pb-2 pt-0 px-2 bg-white">
      {/* Top Badges */}
      <div className="flex justify-between items-center h-[20px]">
        <div className="shimmer h-4 w-12 rounded-sm bg-gray-200" />
        <div className="shimmer h-4 w-16 rounded-sm bg-gray-200" />
      </div>

      {/* Image */}
      <div className="shimmer relative self-center w-full aspect-square rounded bg-gray-200" />

      {/* Name */}
      <div className="flex flex-col items-center gap-1.5 py-1">
        <div className="shimmer h-3.5 w-full rounded bg-gray-200" />
        <div className="shimmer h-3.5 w-3/4 rounded bg-gray-200" />
      </div>

      {/* Price + Cart */}
      <div className="flex justify-between items-center px-1">
        <div className="shimmer h-4 w-16 rounded bg-gray-200" />
        <div className="shimmer h-7 w-7 rounded-md bg-gray-200" />
      </div>

      {/* Rating */}
      <div className="flex items-center justify-center gap-1 mt-1 pb-1">
        <div className="shimmer h-3 w-20 rounded bg-gray-200" />
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

export default ProductCardSkeleton;
