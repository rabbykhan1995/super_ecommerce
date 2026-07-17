import { Metadata } from "next";
import { notFound } from "next/navigation";
import Helper from "@/helper/helper";
import MdxRenderer from "@/components/MDX/MDXRenderer";
import RatingStars from "@/utils/Ui/RatingStars";
import DescriptionToggle from "@/utils/Ui/DescriptionToggle";
import AddToCartButton from "@/components/Buttons/AddToCartButton";
import ProductImageGallery from "@/components/Product/ProductImageGallery";
import { FullProduct } from "@/types/product.types";
import { Package, Truck, Shield, Tag } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/product/productBySlug/${slug}`,
    {
      next: {
        tags: [`product-${slug}`],
      },
    },
  );

  if (!res.ok) return null;
  const response = await res.json();
  return response.success ? response.data : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product: FullProduct = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.name,
    description: product.shortDescription || undefined,
    openGraph: {
      title: product.name,
      description: product.shortDescription || undefined,
      images: product.thumbnail ? [product.thumbnail] : [],
      type: "website",
    },
  };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { slug } = await params;
  const product: FullProduct = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const totalStock = product.variants.reduce(
    (acc, v) => acc + (v.stock ?? 0),
    0,
  );
  const lowestPrice = product.variants.reduce(
    (acc, v) => (v.salePrice && v.salePrice < acc ? v.salePrice : acc),
    product.salePrice,
  );
  const highestPrice = product.variants.reduce(
    (acc, v) => (v.salePrice && v.salePrice > acc ? v.salePrice : acc),
    product.salePrice,
  );
  const priceRange =
    lowestPrice !== highestPrice
      ? `${lowestPrice} - ${highestPrice}`
      : `${product.salePrice}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container_custom py-1">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          {product.category && (
            <>
              <span className="text-gray-400">{product.category.name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Image Section */}
          <div>
            <ProductImageGallery
              images={product.variants.flatMap((v) => v.images ?? [])}
              productName={product.name}
              thumbnail={product.thumbnail}
              featured={product.featured}
            />
          </div>

          {/* Info Section */}
          <div className="flex flex-col">
            {/* Category & Brand */}
            <div className="flex items-center gap-2 mb-3 ">
              {product.category && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 py-1 rounded-full">
                  <Tag size={12} />
                  {product.category.name}
                </span>
              )}
              {product.brand && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {product.brand.name}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <RatingStars average={product.averageRating} />
              <span className="text-sm text-gray-500">
                {product.averageRating?.toFixed(1)} ({product.totalReviews}{" "}
                reviews)
              </span>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-500">
                {product.totalSold} sold
              </span>
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <div className="text-gray-600 text-sm leading-relaxed mb-5 pb-5 border-b border-gray-100">
                <MdxRenderer source={product.shortDescription} />
              </div>
            )}

            {/* Price Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5 shadow-sm">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900">
                  {priceRange} TK
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Tax included. Shipping calculated at checkout.
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-4 mb-5 text-sm">
              <div
                className={`flex items-center gap-1.5 font-medium ${totalStock > 0 ? "text-emerald-600" : "text-red-500"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${totalStock > 0 ? "bg-emerald-500" : "bg-red-500"}`}
                />
                {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
              </div>
              {product.variants.length > 1 && (
                <span className="text-gray-400">
                  {product.variants.length} variants available
                </span>
              )}
            </div>

            {/* Add to Cart */}
            <div className="mb-6">
              <AddToCartButton product={product} />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <Truck size={18} className="text-gray-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  Fast Delivery
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <Shield size={18} className="text-gray-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  Secure Payment
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <Package size={18} className="text-gray-600" />
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  Easy Returns
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {product.description && (
          <div className="mt-12 mb-8">
            <DescriptionToggle>
              <MdxRenderer source={product.description} />
            </DescriptionToggle>
          </div>
        )}

        {/* Product Details */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Product Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.sku && (
              <div>
                <p className="text-xs text-gray-400 mb-1">SKU</p>
                <p className="text-sm font-medium text-gray-700">
                  {product.sku}
                </p>
              </div>
            )}
            {product.unit && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Unit</p>
                <p className="text-sm font-medium text-gray-700">
                  {product.unit.name}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <p className="text-sm font-medium text-gray-700 capitalize">
                {product.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Added</p>
              <p className="text-sm font-medium text-gray-700">
                {Helper.formatDate(product.createdAt as Date)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
