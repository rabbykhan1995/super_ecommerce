export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container_custom py-1">
        {/* Breadcrumb Skeleton */}
        <nav className="flex items-center gap-2 text-sm mb-2">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-2 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </nav>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Image Section Skeleton */}
          <div>
            <div className="aspect-square w-full bg-gray-200 rounded-xl animate-pulse" />
            <div className="flex gap-2 mt-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 w-16 bg-gray-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Info Section Skeleton */}
          <div className="flex flex-col">
            {/* Category & Brand Badges */}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
            </div>

            {/* Title */}
            <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 w-4 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-2 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Short Description */}
            <div className="space-y-2 mb-5 pb-5 border-b border-gray-100">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Price Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5 shadow-sm">
              <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-56 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Add to Cart Button */}
            <div className="mb-6">
              <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description Section Skeleton */}
        <div className="mt-12 mb-8">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Product Details Section Skeleton */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="h-6 w-36 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mb-1" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
