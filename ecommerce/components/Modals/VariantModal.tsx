"use client";

import { X, Star, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Helper from "@/helper/helper";
import useOpenCloseState from "@/zustand/openclose.store";
import { fetchVariantsByProduct } from "@/utils/productApi";
import type { EcomVariantDetail } from "@/types/product.types";

const AUTO_SLIDE_INTERVAL = 4000;

const VariantModal = () => {
  const { variantModalOpen, variantModalProduct, setVariantModalOpen } =
    useOpenCloseState();

  const [isMounted, setIsMounted] = useState(false);
  const [variants, setVariants] = useState<EcomVariantDetail[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<EcomVariantDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // Slider state
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Desktop hover-zoom state
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  // Mobile fullscreen zoom
  const [mobileZoomOpen, setMobileZoomOpen] = useState(false);
  const [mobileZoomIndex, setMobileZoomIndex] = useState(0);
  const [mobileZoomPosition, setMobileZoomPosition] = useState({ x: 50, y: 50 });
  const mobileZoomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch variants when modal opens
  useEffect(() => {
    if (!variantModalOpen || !variantModalProduct?.id) return;

    const loadVariants = async () => {
      setLoading(true);
      try {
        const data = await fetchVariantsByProduct(variantModalProduct.id);
        const sorted = [...data].sort((a, b) => (a.salePrice ?? 0) - (b.salePrice ?? 0));
        setVariants(sorted);
        setSelectedVariant(sorted[0] ?? null);
        setActiveSlide(0);
      } catch (err) {
        console.error("Failed to fetch variants:", err);
        setVariants([]);
        setSelectedVariant(null);
      } finally {
        setLoading(false);
      }
    };

    loadVariants();
  }, [variantModalOpen, variantModalProduct?.id]);

  // Prevent background scroll
  useEffect(() => {
    if (!isMounted) return;
    if (variantModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [variantModalOpen, isMounted]);

  // Reset state when modal closes
  useEffect(() => {
    if (!variantModalOpen) {
      setVariants([]);
      setSelectedVariant(null);
      setActiveSlide(0);
      setIsAutoPlaying(true);
      setIsHovering(false);
      setMobileZoomOpen(false);
    }
  }, [variantModalOpen]);

  // Current images from selected variant
  const currentImages: string[] = selectedVariant?.images?.length
    ? selectedVariant.images
    : variantModalProduct?.thumbnail
      ? [variantModalProduct.thumbnail]
      : [];

  // Auto-slide logic
  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  useEffect(() => {
    stopAutoPlay();
    if (isAutoPlaying && currentImages.length > 1 && !isHovering && !mobileZoomOpen) {
      autoPlayRef.current = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % currentImages.length);
      }, AUTO_SLIDE_INTERVAL);
    }
    return stopAutoPlay;
  }, [isAutoPlaying, currentImages.length, isHovering, mobileZoomOpen, stopAutoPlay]);

  // Reset slide when variant changes
  useEffect(() => {
    setActiveSlide(0);
  }, [selectedVariant?.id]);

  const goToSlide = (index: number) => {
    setActiveSlide(index);
    setIsAutoPlaying(true);
  };

  const goPrev = () => {
    setActiveSlide((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  const goNext = () => {
    setActiveSlide((prev) => (prev + 1) % currentImages.length);
  };

  // Desktop hover zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Mobile touch zoom
  const handleMobileTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setMobileZoomPosition({ x, y });
  };

  const handleClose = () => {
    setVariantModalOpen(false);
  };

  if (!variantModalOpen || !variantModalProduct) return null;

  const product = variantModalProduct;
  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : true;

  // Group attributes by name for display
  const attributeGroups: Record<string, string[]> = {};
  if (selectedVariant?.attributes) {
    for (const attr of selectedVariant.attributes) {
      if (!attributeGroups[attr.name]) attributeGroups[attr.name] = [];
      if (!attributeGroups[attr.name].includes(attr.value)) {
        attributeGroups[attr.name].push(attr.value);
      }
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-39 bg-[#0000006c] flex items-center justify-center">
        <div className="flex relative flex-col md:flex-row gap-4 bg-white rounded-md p-3 lg:p-5 max-w-5xl w-full mx-2 md:mx-auto overflow-y-auto max-h-[82vh] lg:max-h-[92vh] shadow-2xl">

          {/* Close Button */}
          <button
            className="bg-white p-2.5 rounded-full absolute border border-gray-200 top-3 right-3 md:right-4 z-[100] hover:bg-gray-50 transition-colors shadow-sm"
            onClick={handleClose}
          >
            <X className="text-red-500" size={20} />
          </button>

          {/* ===== LEFT: Image Slider ===== */}
          <div className="flex flex-col gap-2 w-full md:w-[55%] lg:w-[60%]">
            {/* Main Image */}
            <div
              className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onMouseMove={handleMouseMove}
            >
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-[#F7311E] rounded-full animate-spin" />
                </div>
              ) : currentImages.length > 0 ? (
                <>
                  {/* Desktop: hover-to-zoom */}
                  <div className="hidden md:block w-full h-full relative">
                    <Image
                      src={Helper.getImage(currentImages[activeSlide])}
                      alt={product.name}
                      fill
                      unoptimized
                      className={`object-contain transition-transform duration-200 ease-out ${
                        isHovering ? "scale-[2.5]" : "scale-100"
                      }`}
                      style={
                        isHovering
                          ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
                          : undefined
                      }
                    />
                  </div>

                  {/* Mobile: static image with zoom icon */}
                  <div className="md:hidden w-full h-full relative">
                    <Image
                      src={Helper.getImage(currentImages[activeSlide])}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-contain"
                    />
                    <button
                      onClick={() => {
                        setMobileZoomIndex(activeSlide);
                        setMobileZoomOpen(true);
                      }}
                      className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                    >
                      <ZoomIn size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <Image
                  src="/no-image.png"
                  alt="No image"
                  fill
                  className="object-contain p-4"
                />
              )}

              {/* Nav Arrows (only if multiple images) */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-md transition-all z-10"
                  >
                    <ChevronLeft size={20} className="text-gray-700" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-md transition-all z-10"
                  >
                    <ChevronRight size={20} className="text-gray-700" />
                  </button>
                </>
              )}

              {/* Slide counter */}
              {currentImages.length > 1 && (
                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                  {activeSlide + 1} / {currentImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {currentImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {currentImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      activeSlide === idx
                        ? "border-[#F7311E] shadow-md"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={Helper.getImage(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Auto-play toggle */}
            {currentImages.length > 1 && (
              <button
                onClick={() => setIsAutoPlaying((p) => !p)}
                className="self-start text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAutoPlaying ? "bg-green-400 animate-pulse" : "bg-gray-300"
                  }`}
                />
                {isAutoPlaying ? "Auto-sliding" : "Paused"}
              </button>
            )}
          </div>

          {/* ===== RIGHT: Variant Details ===== */}
          <div className="flex flex-col gap-3 w-full md:w-[45%] lg:w-[40%] pr-6 md:pr-0">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 leading-tight">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(product.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {product.averageRating?.toFixed(1)} ({product.totalReviews ?? 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl lg:text-3xl font-bold text-green-600">
                ৳ {selectedVariant?.discountPrice && selectedVariant.discountPrice < selectedVariant.salePrice ? selectedVariant.discountPrice : selectedVariant?.salePrice ?? 0}
              </span>
              {selectedVariant?.discountPrice  &&
                selectedVariant.salePrice &&
                selectedVariant?.discountPrice < selectedVariant?.salePrice ?(
                  <del className="text-gray-400 text-sm font-medium">
                    ৳ {selectedVariant?.salePrice}
                  </del>
                ):null}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Stock:</span>
              {isOutOfStock ? (
                <span className="text-sm font-semibold text-red-500">Out of Stock</span>
              ) : (
                <span className="text-sm font-semibold text-green-600">
                  {selectedVariant?.stock ?? "N/A"} available
                </span>
              )}
            </div>

            {/* Variant Selector */}
            {loading ? (
              <div className="text-sm text-gray-400 py-2">Loading variants...</div>
            ) : variants.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-600">Variants:</span>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const label = v.attributes
                      .map((a) => a.value)
                      .join(" / ");
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                          selectedVariant?.id === v.id
                            ? "bg-[#F7311E] text-white border-[#F7311E] shadow-md"
                              : "bg-white text-gray-700 border-gray-300 hover:border-[#F7311E] hover:text-[#F7311E]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Attributes */}
            {selectedVariant?.attributes &&
              selectedVariant.attributes.length > 0 &&
              !(selectedVariant.attributes.length === 1 &&
                selectedVariant.attributes[0].name === "base" &&
                selectedVariant.attributes[0].value === "none") && (
                <div className="flex flex-col gap-1.5 bg-gray-50 rounded-lg p-3">
                  <span className="text-sm font-medium text-gray-600">Attributes:</span>
                  <div className="flex flex-wrap gap-3">
                    {selectedVariant.attributes.map((attr, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-gray-500">{attr.name}: </span>
                        <span className="font-medium text-gray-800">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Short Description */}
            {product.shortDescription && (
              <div
                className="text-sm text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.shortDescription }}
              />
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-auto pt-2">
              {isOutOfStock ? (
                <span className="text-red-500 font-semibold text-sm">Out of Stock</span>
              ) : (
                <>
                  {/* TODO: Cart_Button / CartButtonForMobile */}
                </>
              )}

              <Link
                onClick={handleClose}
                href={`/product/${product.slug}`}
                prefetch={false}
                className="ml-auto text-sm text-green-600 border border-green-600 px-4 py-1.5 rounded-lg hover:bg-green-50 transition-colors font-medium"
              >
                More Info
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MOBILE FULLSCREEN ZOOM OVERLAY ===== */}
      {mobileZoomOpen && (
        <div
          ref={mobileZoomRef}
          className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center"
          onTouchMove={handleMobileTouchMove}
          onClick={() => setMobileZoomOpen(false)}
        >
          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMobileZoomOpen(false);
            }}
            className="absolute top-4 right-4 z-[70] bg-white/20 backdrop-blur-sm p-2 rounded-full"
          >
            <X className="text-white" size={24} />
          </button>

          {/* Zoom Image */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <Image
              src={Helper.getImage(currentImages[mobileZoomIndex] || currentImages[0])}
              alt={product.name}
              fill
              unoptimized
              className="object-contain scale-[2]"
              style={{
                transformOrigin: `${mobileZoomPosition.x}% ${mobileZoomPosition.y}%`,
              }}
            />
          </div>

          {/* Nav in zoom view */}
          {currentImages.length > 1 && (
            <div className="absolute bottom-6 flex items-center gap-4 z-[70]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileZoomIndex(
                    (prev) => (prev - 1 + currentImages.length) % currentImages.length,
                  );
                }}
                className="bg-white/20 backdrop-blur-sm p-3 rounded-full"
              >
                <ChevronLeft className="text-white" size={24} />
              </button>
              <span className="text-white text-sm font-medium">
                {mobileZoomIndex + 1} / {currentImages.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileZoomIndex(
                    (prev) => (prev + 1) % currentImages.length,
                  );
                }}
                className="bg-white/20 backdrop-blur-sm p-3 rounded-full"
              >
                <ChevronRight className="text-white" size={24} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default VariantModal;
