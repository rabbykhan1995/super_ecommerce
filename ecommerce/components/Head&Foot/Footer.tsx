import { shadowsIntoLight } from "@/lib/font";
import { Facebook, Instagram, LocateOffIcon, Twitter, X, Youtube } from "lucide-react";
import Link from "next/link";
import BrandLogo from "../Logos/BrandLogo";

const Footer = () => {
  return (
  <div className="flex justify-center w-full bg-[#353636] text-[#d3d3d3] py-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 lg:px-20 text-sm w-full lg:w-250 xl:w-7xl px-2 xl:px-4">
      <div className="flex flex-col gap-5 capitalize col-span-1">
        <BrandLogo />
        <h1 className="uppercase font-bold">Our products are ensured directly from brands or authorized distributors. They’re stored and shipped directly from our climate-controlled, GMP-certified warehouses.!</h1>
        <h1 className="flex gap-1"><LocateOffIcon size={30} className="bg-white rounded-full p-1 text-black"/><span>House# 44, Rd No. 2/A, Dhanmondi, Dhaka 1209</span></h1>
        <h1>Nutrition Plans</h1>
      </div>
      <div className="flex flex-col gap-5 capitalize col-span-1">
        <h1 className="uppercase font-bold"></h1>
        <h1>MacroFactor Diet App</h1>
        <h1>Mass Research Review</h1> <h1>Neck Flex</h1>
      </div>
      {/* Subscription */}
      <div className="flex flex-col gap-5 capitalize col-span-2 py-10 lg:py-0">
        <h1 className="uppercase font-bold">
          Get my zero fluff, 1 paragraph weekly newsletter. For FREE!
        </h1>
        <div className="flex gap-4 ">
          <input
            type="text"
            name=""
            id=""
            placeholder="Your Email Address"
            className="border border-gray-400 px-3 py-3 rounded-sm w-4/5"
          />
          <button className="bg-[#000000] text-white px-3 rounded-md font-bold text-nowrap">
            SIGN UP
          </button>
        </div>
      </div>
      <div className="flex justify-end col-span-full py-10">
        <div className="flex justify-between w-sm">
          <a href="#">
            <Youtube size={20} />
          </a>
          <a href="#">
            <Facebook size={20} />
          </a>
          <a href="#">
            <Instagram size={20} />
          </a>
          <a href="#">
            <Instagram size={20} />
          </a>
        </div>
      </div>
      <div className="flex flex-col items-center col-span-full py-5">
        <h1>© 2026 Jeff Nippard Fitness. All Rights Reserved.</h1>
        <div className="py-5">
          <Link href={"#"}>PRIVACY POLICY</Link>
          <span className="px-5">|</span>
          <Link href={"#"}>TERMS OF SERVICE</Link>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Footer;
