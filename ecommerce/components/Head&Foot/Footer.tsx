"use client";

import { shadowsIntoLight } from "@/lib/font";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MapPin,
  Mail,
  Phone,
  Send,
} from "lucide-react";
import Link from "next/link";
import BrandLogo from "../Logos/BrandLogo";

const Footer = () => {
  return (
    <div className="flex justify-center w-full bg-[#1a1c1e] text-[#c9cbcc] py-5 pb-20 lg:pb-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 text-sm w-full lg:w-250 xl:w-7xl px-2 xl:px-4 gap-y-10">
        {/* Brand & About */}
        <div className="flex flex-col gap-4 col-span-2 lg:col-span-1">
          <BrandLogo />
          <p className="text-[13px] leading-relaxed text-gray-400">
            Our products are sourced directly from brands or authorized
            distributors and shipped from our climate-controlled,
            GMP-certified warehouses.
          </p>
          <div className="flex items-start gap-2 text-[13px]">
            <MapPin size={16} className="text-[#F7311E] mt-[2px] shrink-0" />
            <span>House# 44, Rd No. 2/A, Dhanmondi, Dhaka 1209</span>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <Phone size={16} className="text-[#F7311E] shrink-0" />
            <span>+880 1234-567890</span>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <Mail size={16} className="text-[#F7311E] shrink-0" />
            <span>support@example.com</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3 col-span-1">
          <h1 className="uppercase font-bold text-white tracking-wide text-[13px] mb-1">
            Quick Links
          </h1>
          <Link href="/about" className="hover:text-white transition-colors">
            About Us
          </Link>
          <Link href="/products" className="hover:text-white transition-colors">
            All Products
          </Link>
          <Link href="/training&programs" className="hover:text-white transition-colors">
            Training &amp; Programs
          </Link>
          <Link href="/faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
        </div>

        {/* Customer Service */}
        <div className="flex flex-col gap-3 col-span-1">
          <h1 className="uppercase font-bold text-white tracking-wide text-[13px] mb-1">
            Customer Service
          </h1>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact Us
          </Link>
          <Link href="/shipping-policy" className="hover:text-white transition-colors">
            Shipping Policy
          </Link>
          <Link href="/return-refund-policy" className="hover:text-white transition-colors">
            Return &amp; Refund
          </Link>
          <Link href="/track-order" className="hover:text-white transition-colors">
            Track Order
          </Link>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-4 col-span-2 lg:col-span-1">
          <h1 className="uppercase font-bold text-white tracking-wide text-[13px]">
            Stay Updated
          </h1>
          <p className="text-[13px] text-gray-400">
            Subscribe for exclusive offers, new arrivals, and updates. No spam,
            ever.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="border border-gray-600 bg-transparent px-3 py-2 rounded-md w-full text-[13px] placeholder:text-gray-500 focus:outline-none focus:border-[#F7311E] transition-colors"
            />
            <button className="bg-[#F7311E] hover:bg-[#d81e0f] transition-colors text-white px-3 rounded-md flex items-center justify-center shrink-0">
              <Send size={16} />
            </button>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3 mt-2">
            {[Youtube, Facebook, Instagram, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="p-2 rounded-full border border-gray-600 hover:bg-[#F7311E] hover:border-[#F7311E] transition-colors"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="col-span-full border-t border-gray-700 mt-4"></div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 col-span-full py-5 text-[12px] text-gray-400">
          <h1>© 2026 Jeff Nippard Fitness. All Rights Reserved.</h1>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="#" className="hover:text-white transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;