"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Link from "next/link";
import { useState } from "react";

const Hero = () => {
  const [banners] = useState([
    {
      id: 1,
      photo:
        "https://smartpressblog.imgix.net/wp-content/uploads/2024/05/types-of-banners.jpg?w=1920&h=1080&fit=crop&auto=format,compress",
      alt: "Fashion Collection Banner",
    },
    {
      id: 2,
      photo:
        "https://cdn.dribbble.com/userupload/15563221/file/original-5b936ac74761833ae32d72516a0f5174.jpg?resize=752x&vertical=center",
      alt: "Modern Ecommerce Banner",
    },
    {
      id: 3,
      photo:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80",
      alt: "Lifestyle Shopping Banner",
    },
    {
      id: 4,
      photo:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=80",
      alt: "New Arrival Fashion Banner",
    },
  ]);
  const [bannerLoading] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-1 w-full font-medium lg:py-2 pt-10">
      {/* Left / Top with Swiper */}
      {bannerLoading ? (
        <div className="bg-[#e6e6e6] w-full lg:w-4/5 h-[35vh] lg:h-[40vh]"></div>
      ) : (
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{
            clickable: true,
            el: ".custom-pagination",
            bulletClass: "custom-bullet",
            bulletActiveClass: "custom-bullet-active",
            renderBullet: (index, className) =>
              `<span class="${className}"></span>`,
          }}
          spaceBetween={20}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="relative w-full lg:w-4/5 h-[35vh] lg:h-[40vh] rounded-sm overflow-hidden"
        >
          {banners.map((item, i) => (
            <SwiperSlide
              key={item.id}
              className="rounded-md bg-contain bg-no-repeat relative"
            >
              <Image
                src={item?.photo}
                alt={item?.alt || "banner"}
                onClick={() => {
                  window.open("http://localhost:3000/", "_blank");
                }}
                fill
                priority={i === 0}
                className="object-cover cursor-pointer"
              />
            </SwiperSlide>
          ))}

          {/* custom pagination container */}
          <div className="custom-pagination"></div>
        </Swiper>
      )}

      {/* Right/ bottom - Coupon Section (unchanged from before) */}
      <div className="lg:w-1/5 hidden lg:flex p-1 flex-col gap-4 justify-center rounded-sm border border-gray-200">
        <h1 className="text-[15px] font-semibold text-[#c81e1e] tracking-wide">
          🔥 Latest Super Discount
        </h1>
        <div className="flex flex-col gap-4">
          {[1, 2].map((e, i) => (
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

      {/* Mobile Swiper (unchanged) */}
      <div className="w-full flex lg:hidden">
        <Swiper
          modules={[Autoplay]}
          pagination={{ clickable: true }}
          spaceBetween={20}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={true}
          className="w-full flex h-[15vh]"
        >
          {[1, 2].map((item, i) => (
            <SwiperSlide
              key={i}
              className="h-full rounded-md flex items-center justify-center gap-3"
            >
              <Link href={`/hello`} className="flex h-full items-center gap-5">
                <div
                  className="h-full w-1/4 bg-center bg-contain bg-no-repeat"
                  style={{
                    backgroundImage:
                      'url("https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjJoNDh6emI1ODVtbXZrbHZwM3JjYWIxYWljNzM3b2FtZXF0N3I3YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/sgTMINOA908LfcmUWh/giphy.gif")',
                  }}
                />
                <h1 className="w-3/4 font-bold">hello 50% off</h1>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ✅ FIXED + STYLISH PAGINATION CSS */}
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