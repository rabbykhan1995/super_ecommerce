"use client";
import Helper from "@/helper/helper";
import { ShoppingBag, Star, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { EcomProduct } from "@/types/product.types";
import useOpenCloseState from "@/zustand/openclose.store";
interface ProductCardProps {
  product: EcomProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [hover, setHover] = useState(false);
  const [played, setPlayed] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isStoppedManually, setIsStoppedManually] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageSrc = Helper.getImage(product.thumbnail);
  const inStock = product.stock > 0;
  const { setVariantModalOpen, setVariantModalProduct } = useOpenCloseState();
  // ⚠️ ধরে নেওয়া হয়েছে এই ফিল্ডগুলো EcomProduct টাইপে optional হিসেবে আছে
  const VIDEO_URL = product.video ?? null;
  const hasDiscount =
    !!product.discountPrice &&
    !!product.salePrice &&
    product.discountPrice < product.salePrice;
  const discountPercent = hasDiscount
    ? (100 - (product.discountPrice! * 100) / product.salePrice!).toFixed(0)
    : null;

  const updateProgress = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setPlayed((video.currentTime / video.duration) * 100);
    if (video.buffered.length > 0) {
      setBuffered(
        (video.buffered.end(video.buffered.length - 1) / video.duration) *
        100,
      );
    }
  };

  // --- Mobile: scroll এ ভিডিও প্লে ---
  useEffect(() => {
    if (!VIDEO_URL) return;
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!isStoppedManually) {
              setHover(true);
              setShowProgress(true);
              if (!videoSrc) setVideoSrc(VIDEO_URL);
              videoRef.current?.play().catch(() => { });
            } else {
              setHover(true);
            }
          } else {
            setHover(false);
            setShowProgress(false);
            setIsStoppedManually(false);
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.8 },
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [VIDEO_URL, videoSrc, isStoppedManually]);

  // --- Desktop: hover এ ভিডিও প্লে ---
  const handleMouseEnter = () => {
    if (!VIDEO_URL || window.innerWidth < 768) return;
    setHover(true);
    setShowProgress(true);
    setIsStoppedManually(false);
    if (!videoSrc) {
      setVideoSrc(VIDEO_URL);
    } else {
      videoRef.current?.play().catch(() => { });
    }
  };

  const handleMouseLeave = () => {
    if (!VIDEO_URL || window.innerWidth < 768) return;
    setHover(false);
    setShowProgress(false);
    videoRef.current?.pause();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          className={
            i <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }
        />,
      );
    }
    return stars;
  };

  return (
    <div
      ref={cardRef}
      className="Product_Card flex text-center flex-col gap-1 col-span-1 rounded-md shadow-md max-w-[400px] pb-2 pt-0 px-2 bg-white justify-between"
    >
      {/* Top Badges */}
      <div className="flex justify-between items-center h-[20px] z-10 relative">
        {hasDiscount && inStock ? (
          <span className="bg-[#F7311E] text-white text-[11px] font-bold px-2 py-[2px] rounded-sm">
            -{discountPercent}%
          </span>
        ) :(
          <div />
        )}

        {inStock ? (
          <h1 className="text-xs text-white right-[-8px] top-0 absolute px-2 py-1 bg-green-500 rounded-xs">
            Sold: {product.totalSold}
          </h1>
        ) : (
          <h1 className="text-xs w-full text-center text-white px-2 py-1 rounded-sm font-[600] bg-[#919191]">
            Out Of Stock
          </h1>
        )}
      </div>

      {/* Media Section */}
      <div
        className="relative self-center cursor-pointer w-full aspect-square"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link href={`/product/${product.slug}`}>
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </Link>

        {VIDEO_URL && (
          <>
            <video
              ref={videoRef}
              src={videoSrc || ""}
              muted
              loop
              playsInline
              preload="auto"
              onCanPlay={(e) => {
                if (hover && !isStoppedManually) {
                  e.currentTarget.play().catch(() => { });
                }
              }}
              className={`absolute inset-0 w-full h-full object-contain bg-white transition-opacity duration-300 ${hover && !isStoppedManually
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
                }`}
              onTimeUpdate={updateProgress}
              onProgress={updateProgress}
            />

            {hover && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isStoppedManually) {
                    setIsStoppedManually(false);
                    videoRef.current?.play().catch(() => { });
                  } else {
                    setIsStoppedManually(true);
                    videoRef.current?.pause();
                  }
                }}
                className="md:hidden absolute top-2 right-2 z-10 bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg"
              >
                {isStoppedManually ? <Play size={16} /> : <Pause size={16} />}
              </button>
            )}

            <div
              className={`absolute bottom-0 left-0 w-full h-[3px] overflow-hidden transition-all duration-300 ${showProgress && !isStoppedManually
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
                }`}
            >
              <div
                style={{ width: `${buffered}%` }}
                className="h-full bg-gray-400 absolute left-0 top-0 transition-all duration-300"
              />
              <div
                style={{ width: `${played}%` }}
                className="h-full bg-[#F7311E] absolute left-0 top-0 transition-all duration-100"
              />
            </div>
          </>
        )}
      </div>

      {/* Name */}
      <h1 className="text-zinc-500 tracking-tight font-base text-md text-center leading-snug h-[3rem] overflow-hidden">
        {product.name}
      </h1>

      {/* Price + Cart */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center text-sm font-bold">
          <span className="text-green-600 text-xs sm:text-sm">
            ৳ {(hasDiscount? Helper.formatLongNumber(product.discountPrice!):Helper.formatLongNumber(product.salePrice))}
          </span>
          {hasDiscount && (
            <del className="text-zinc-400 font-medium text-xs sm:text-sm">
              ৳ {Helper.formatLongNumber(product.salePrice)}
            </del>
          )}
        </div>

        {inStock ? (
          <button onClick={() => {
            setVariantModalProduct(product);
            setVariantModalOpen(true);
          }} className="px-3 py-1 text-xs rounded-md bg-[#F7311E] text-white hover:bg-[#df2815] transition">
            <ShoppingBag size={18} />
          </button>
        ) : (
          <Link
            href={`/product/${product.slug}`}
            className="px-1 shadow-md border border-gray-300 py-0.5 text-xs hover:text-[#f7311e] rounded-md transition"
          >
            Read More
          </Link>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center justify-center gap-1 mt-1 pb-1">
        {renderStars(product.averageRating)}
        <span className="text-xs text-gray-500">
          {product.averageRating.toFixed(1)} ({Helper.formatLongNumber(product.totalReviews)})
        </span>
      </div>
    </div>
  );
};

export default ProductCard;