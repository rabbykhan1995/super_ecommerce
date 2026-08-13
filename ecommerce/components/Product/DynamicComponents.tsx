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

const MdxRenderer = dynamic(
  () => import("@/components/MDX/MDXRendererClient"),
  {
    ssr: false,
    loading: () => <div className="h-10 bg-gray-100 rounded animate-pulse" />,
  }
);

export { ProductImageGallery, MdxRenderer };
