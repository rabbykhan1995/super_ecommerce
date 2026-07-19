"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/utils/apiconfig";
import BannerSkeleton from "../Skeletons/BannerSkeleton";

interface Banner {
  id: number;
  title: string;
  photo: string;
  link: string | null;
}

const Hero = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/ecom/banner/active")
      .then((res) => {
        if (res.data.success) setBanners(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleBannerClick = (link: string | null) => {
    if (link) window.open(link, "_blank");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-1 w-full font-medium lg:py-2 pt-10">
      {/* Left / Top with Swiper */}
      {loading ? (
        <BannerSkeleton />
      ) : banners.length > 0 ? (
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{
            clickable: true,
            el: ".custom-pagination",
            bulletClass: "custom-bullet",
            bulletActiveClass: "custom-bullet-active",
            renderBullet: (_index, className) =>
              `<span class="${className}"></span>`,
          }}
          spaceBetween={20}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={banners.length > 1}
          className="relative w-full lg:w-4/5 h-[35vh] lg:h-[40vh] rounded-sm overflow-hidden"
        >
          {banners.map((item, i) => (
            <SwiperSlide key={item.id} className="rounded-md relative">
              <Image
                src={item.photo}
                alt={item.title}
                onClick={() => handleBannerClick(item.link)}
                fill
                priority={i === 0}
                className="object-cover cursor-pointer"
              />
            </SwiperSlide>
          ))}
          <div className="custom-pagination"></div>
        </Swiper>
      ) : (
        <div className="bg-[#e6e6e6] w-full lg:w-4/5 h-[35vh] lg:h-[40vh] rounded-sm" />
      )}

      {/* Right/ bottom - Coupon Section */}
      <div className="lg:w-1/5 hidden lg:flex p-1 flex-col gap-4 justify-center rounded-sm border border-gray-200">
        <h1 className="text-[15px] font-semibold text-[#c81e1e] tracking-wide">
          🔥 Latest Super Discount
        </h1>
        <div className="flex flex-col gap-4">
          {[1, 2].map((_e, i) => (
            <div
              key={i}
              className="relative flex gap-3 bg-white rounded-xl border border-gray-200 duration-300 p-2 overflow-hidden group"
            >
              <div className="absolute -left-8 top-2 rotate-[-45deg] bg-[#F7311E] text-white text-[10px] font-bold px-8 py-[2px]">
                50%
              </div>
              <div className="w-1/3 flex items-center justify-center">
                <Image
                  src="https://image.dokanpat.top/uploads/Gillette%20Reguler%20Sheaving%20Foam%20-98gm_images.jpg"
                  width={80}
                  height={80}
                  alt="image"
                  loading="lazy"
                  className="object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col justify-center gap-1 w-2/3">
                <div className="flex items-center justify-between">
                  <h1 className="text-[13px] font-semibold text-gray-800">
                    August Gift Voucher
                  </h1>
                  <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-[2px] rounded-full">
                    Inactive
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] mt-1">
                  {["00", "00", "00", "00"].map((val, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="text-white bg-gradient-to-b from-[#F7311E] to-[#c81e1e] py-[3px] px-[7px] rounded-md font-mono">
                        {val}
                      </span>
                      {idx < 3 && <span className="text-gray-400">:</span>}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="border border-dashed border-[#F7311E] text-[#F7311E] text-[11px] font-semibold py-[2px] px-2 rounded-md">
                    Coupon234
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">
                  * Applies on orders above $2000
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination CSS */}
      <style jsx global>{`
        .custom-pagination {
          position: absolute !important;
          bottom: 14px !important;
          left: 50% !important;
          transform: translateX(-50%);
          z-index: 20 !important;
          display: flex !important;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 999px;
          width: fit-content !important;
        }

        .custom-bullet {
          width: 9px !important;
          height: 9px !important;
          border-radius: 999px !important;
          background: rgba(255, 255, 255, 0.55) !important;
          opacity: 1 !important;
          cursor: pointer;
          transition: all 0.4s ease;
          display: inline-block !important;
          margin: 0 !important;
        }

        .custom-bullet:hover {
          background: rgba(255, 255, 255, 0.85) !important;
        }

        .custom-bullet-active {
          width: 28px !important;
          background: linear-gradient(90deg, #ff5f45, #ff2d55) !important;
          box-shadow: 0 0 10px rgba(255, 45, 85, 0.7);
        }
      `}</style>
    </div>
  );
};

export default Hero;
