"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Helper from "@/helper/helper";
import { ZoomIn } from "lucide-react";

type Props = {
  src: string | null;
  alt: string;
};

export default function ProductImageZoom({ src, alt }: Props) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  const imageUrl = Helper.getImage(src);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-crosshair overflow-hidden group"
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Zoomed overlay image */}
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-200 ${
          isZoomed ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "200%",
          backgroundPosition: `${position.x}% ${position.y}%`,
        }}
      />

      {/* Zoom hint icon */}
      <div
        className={`absolute bottom-3 right-3 z-20 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full transition-opacity duration-200 ${
          isZoomed ? "opacity-0" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <ZoomIn size={16} />
      </div>
    </div>
  );
}
