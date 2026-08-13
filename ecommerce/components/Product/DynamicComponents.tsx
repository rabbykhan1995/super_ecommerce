"use client";

import dynamic from "next/dynamic";

const ProductImageGallery = dynamic(
  () => import("@/components/Product/ProductImageGallery"),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
    ),
  }
);

export { ProductImageGallery};
