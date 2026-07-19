"use client";

const BannerSkeleton = () => {
  return (
    <>
      {/* Desktop banner skeleton */}
      <div className="hidden lg:block w-4/5 h-[40vh] rounded-sm overflow-hidden relative">
        <div className="shimmer absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer w-2.5 h-2.5 rounded-full bg-gray-200" />
          ))}
        </div>
      </div>

      {/* Mobile banner skeleton */}
      <div className="lg:hidden w-full h-[15vh] rounded-sm overflow-hidden relative">
        <div className="shimmer absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
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
    </>
  );
};

export default BannerSkeleton;
