"use client";

import { useState, useRef, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, FreeMode, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Maximize2,
  X,
  Package,
} from "lucide-react";
import Image from "next/image";
import Helper from "@/helper/helper";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

const ZOOM_RATIO = 2.5;

interface Props {
  images: string[];
  productName: string;
  thumbnail: string | null;
  featured: boolean;
}

export default function ProductImageGallery({
  images,
  productName,
  thumbnail,
  featured,
}: Props) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Desktop: Amazon-style side-panel zoom
  const [isDesktopHovering, setIsDesktopHovering] = useState(false);
  const [zoomCursor, setZoomCursor] = useState({ x: 50, y: 50 });
  const [zoomPanelImage, setZoomPanelImage] = useState("");

  // Mobile: double-tap zoom
  const [mobileZoomed, setMobileZoomed] = useState(false);
  const [mobileZoomOrigin, setMobileZoomOrigin] = useState({ x: 50, y: 50 });
  const [mobilePan, setMobilePan] = useState({ x: 0, y: 0 });
  const lastTapRef = useRef(0);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const didPanRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fullscreen lightbox
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  // Build deduplicated image list: thumbnail first, then variant images
  const allImages: string[] = [];
  const seen = new Set<string>();

  if (thumbnail) {
    const t = thumbnail.trim();
    if (t && !seen.has(t)) {
      allImages.push(t);
      seen.add(t);
    }
  }
  for (const img of images) {
    if (!img) continue;
    const trimmed = img.trim();
    if (trimmed && !seen.has(trimmed)) {
      allImages.push(trimmed);
      seen.add(trimmed);
    }
  }

  const hasMultiple = allImages.length > 1;
  const currentImageUrl = Helper.getImage(allImages[activeIndex] ?? "");

  // Desktop: Amazon-style side-panel zoom handler
  const handleDesktopMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomCursor({ x, y });
    setZoomPanelImage(currentImageUrl);
  };

  const handleDesktopMouseEnter = () => {
    setIsDesktopHovering(true);
    setZoomPanelImage(currentImageUrl);
  };

  const handleDesktopMouseLeave = () => {
    setIsDesktopHovering(false);
    setZoomPanelImage("");
  };

  // Mobile: double-tap to zoom
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!e.currentTarget.contains(e.target as Node)) return;
      const now = Date.now();
      const touch = e.touches[0];
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        e.preventDefault();
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;

        if (mobileZoomed) {
          setMobileZoomed(false);
          setMobilePan({ x: 0, y: 0 });
          setMobileZoomOrigin({ x: 50, y: 50 });
        } else {
          setMobileZoomOrigin({ x, y });
          setMobileZoomed(true);
          setMobilePan({ x: 0, y: 0 });
        }
        lastTapRef.current = 0;
        return;
      }

      lastTapRef.current = now;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      didPanRef.current = false;
    },
    [mobileZoomed],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!mobileZoomed) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        didPanRef.current = true;
      }

      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const maxPanX = rect.width * 0.75;
      const maxPanY = rect.height * 0.75;

      setMobilePan({
        x: Math.max(-maxPanX, Math.min(maxPanX, dx)),
        y: Math.max(-maxPanY, Math.min(maxPanY, dy)),
      });
    },
    [mobileZoomed],
  );

  const handleTouchEnd = useCallback(() => {
    if (mobileZoomed && !didPanRef.current) {
      setMobileZoomed(false);
      setMobilePan({ x: 0, y: 0 });
      setMobileZoomOrigin({ x: 50, y: 50 });
    }
  }, [mobileZoomed]);

  if (allImages.length === 0) {
    return (
      <div className="relative aspect-square bg-white rounded-sm overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center text-gray-300">
        <Package size={64} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main Image + Desktop Zoom Panel wrapper */}
        <div className="relative">
          {/* Main Image Swiper */}
          <div
            ref={containerRef}
            className="relative aspect-square bg-white rounded-2xl border border-gray-100 shadow-sm group overflow-hidden lg:overflow-visible"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={handleDesktopMouseEnter}
            onMouseLeave={handleDesktopMouseLeave}
            onMouseMove={handleDesktopMouseMove}
          >
            {featured && (
              <div className="absolute top-4 left-4 z-20 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Featured
              </div>
            )}

            <Swiper
              modules={[Thumbs, Navigation]}
              navigation={{
                nextEl: ".product-gallery-next",
                prevEl: ".product-gallery-prev",
              }}
              thumbs={{
                swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
              }}
              onSlideChange={(swiper) => {
                setActiveIndex(swiper.realIndex);
                if (mobileZoomed) {
                  setMobileZoomed(false);
                  setMobilePan({ x: 0, y: 0 });
                  setMobileZoomOrigin({ x: 50, y: 50 });
                }
              }}
              spaceBetween={0}
              slidesPerView={1}
              loop={hasMultiple}
              allowTouchMove={!mobileZoomed}
              className="w-full h-full"
            >
              {allImages.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <div className="relative w-full h-full">
                    {/* Desktop: plain image (no zoom transform — zoom panel handles it) */}
                    <div className="hidden md:flex w-full h-full items-center justify-center p-2">
                      <Image
                        src={Helper.getImage(img)}
                        alt={`${productName} ${idx + 1}`}
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>

                    {/* Mobile: double-tap to zoom + drag to pan */}
                    <div className="md:hidden w-full h-full relative overflow-hidden">
                      <Image
                        src={Helper.getImage(img)}
                        alt={`${productName} ${idx + 1}`}
                        fill
                        unoptimized
                        className={`object-contain p-4 transition-transform duration-200 ease-out ${
                          mobileZoomed ? "scale-[2.5]" : "scale-100"
                        }`}
                        style={{
                          transformOrigin: `${mobileZoomOrigin.x}% ${mobileZoomOrigin.y}%`,
                          transform: `scale(${mobileZoomed ? 2.5 : 1}) translate(${mobilePan.x / 2.5}px, ${mobilePan.y / 2.5}px)`,
                        }}
                        draggable={false}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Nav Arrows */}
            {hasMultiple && (
              <>
                <button className="product-gallery-prev absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-md transition-all z-10 opacity-0 group-hover:opacity-100">
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>
                <button className="product-gallery-next absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-md transition-all z-10 opacity-0 group-hover:opacity-100">
                  <ChevronRight size={20} className="text-gray-700" />
                </button>
              </>
            )}

            {/* Bottom-left: Slide Counter + Fullscreen Button */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
              {hasMultiple && (
                <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                  {activeIndex + 1} / {allImages.length}
                </div>
              )}
              <button
                onClick={() => setFullscreenOpen(true)}
                className="bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
              >
                <Maximize2 size={14} />
              </button>
            </div>

            {/* Mobile: zoom hint */}
            {!mobileZoomed && (
              <div className="md:hidden absolute bottom-3 right-3 z-10 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 opacity-60 pointer-events-none">
                <ZoomIn size={10} />
                Double-tap to zoom
              </div>
            )}
          </div>

          {/* Desktop: Amazon-style Zoom Panel (right side) */}
          {isDesktopHovering && zoomPanelImage && (
            <div
              className="hidden lg:block absolute top-0 left-full ml-4 w-[500px] h-[500px] bg-white rounded-md border border-gray-100 shadow-lg overflow-hidden z-30 pointer-events-none"
              style={{
                backgroundImage: `url(${zoomPanelImage})`,
                backgroundSize: `${ZOOM_RATIO * 100}%`,
                backgroundPosition: `${zoomCursor.x}% ${zoomCursor.y}%`,
                backgroundRepeat: "no-repeat",
              }}
            />
          )}
        </div>

        {/* Thumbnail Strip */}
        {hasMultiple && (
          <Swiper
            onSwiper={setThumbsSwiper}
            modules={[FreeMode]}
            spaceBetween={8}
            slidesPerView="auto"
            freeMode={true}
            watchSlidesProgress
            className="thumb-strip"
          >
            {allImages.map((img, idx) => (
              <SwiperSlide key={idx} style={{ width: "auto" }}>
                <button className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all hover:border-gray-400 thumb-item">
                  <Image
                    src={Helper.getImage(img)}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* ===== FULLSCREEN LIGHTBOX ===== */}
      {fullscreenOpen && (
        <FullscreenLightbox
          images={allImages}
          initialIndex={activeIndex}
          productName={productName}
          onClose={() => setFullscreenOpen(false)}
        />
      )}
    </>
  );
}

/* ===== Fullscreen Lightbox ===== */

function FullscreenLightbox({
  images,
  initialIndex,
  productName,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  productName: string;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const lastTapRef = useRef(0);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const didPanRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const goPrev = () => {
    setCurrentIndex((p) => (p - 1 + images.length) % images.length);
    resetZoom();
  };
  const goNext = () => {
    setCurrentIndex((p) => (p + 1) % images.length);
    resetZoom();
  };

  const resetZoom = () => {
    setZoomed(false);
    setPan({ x: 0, y: 0 });
    setZoomOrigin({ x: 50, y: 50 });
  };

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const now = Date.now();
      const touch = e.touches[0];
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        e.preventDefault();
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;

        if (zoomed) {
          resetZoom();
        } else {
          setZoomOrigin({ x, y });
          setZoomed(true);
          setPan({ x: 0, y: 0 });
        }
        lastTapRef.current = 0;
        return;
      }

      lastTapRef.current = now;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      didPanRef.current = false;
    },
    [zoomed],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!zoomed) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        didPanRef.current = true;
      }

      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const maxPanX = rect.width * 0.75;
      const maxPanY = rect.height * 0.75;

      setPan({
        x: Math.max(-maxPanX, Math.min(maxPanX, dx)),
        y: Math.max(-maxPanY, Math.min(maxPanY, dy)),
      });
    },
    [zoomed],
  );

  const handleTouchEnd = useCallback(() => {
    if (zoomed && !didPanRef.current) {
      resetZoom();
    }
  }, [zoomed]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIndex, images.length],
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[80] bg-black flex flex-col items-center justify-center select-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[90] bg-white/15 backdrop-blur-sm p-2.5 rounded-full hover:bg-white/25 transition-colors"
      >
        <X className="text-white" size={22} />
      </button>

      {/* Image */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <Image
          src={Helper.getImage(images[currentIndex])}
          alt={`${productName} ${currentIndex + 1}`}
          fill
          unoptimized
          className="object-contain transition-transform duration-200 ease-out"
          style={{
            transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
            transform: `scale(${zoomed ? 2.5 : 1}) translate(${pan.x / 2.5}px, ${pan.y / 2.5}px)`,
          }}
          draggable={false}
        />
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-[90] flex items-center justify-center gap-4 py-4 bg-gradient-to-t from-black/60 to-transparent">
        {images.length > 1 && (
          <button
            onClick={goPrev}
            className="bg-white/15 backdrop-blur-sm p-3 rounded-full hover:bg-white/25 transition-colors"
          >
            <ChevronLeft className="text-white" size={22} />
          </button>
        )}

        <div className="flex items-center gap-3">
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
          {!zoomed && (
            <span className="text-white/50 text-[10px]">Double-tap to zoom</span>
          )}
        </div>

        {images.length > 1 && (
          <button
            onClick={goNext}
            className="bg-white/15 backdrop-blur-sm p-3 rounded-full hover:bg-white/25 transition-colors"
          >
            <ChevronRight className="text-white" size={22} />
          </button>
        )}
      </div>
    </div>
  );
}
