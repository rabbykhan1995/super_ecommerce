"use client";

import React from "react";
import { ShieldCheck, Truck, RotateCcw, HeadphonesIcon } from "lucide-react";

const STATS = [
  { value: "50K+", label: "Happy Customers" },
  { value: "10K+", label: "Products Sold" },
  { value: "4.9", label: "Average Rating" },
  { value: "24/7", label: "Customer Support" },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Quality Guaranteed",
    description:
      "Every product is sourced from authorized distributors and goes through strict quality checks before reaching you.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description:
      "We ship from climate-controlled warehouses across the country to ensure your orders arrive quickly and safely.",
  },
  {
    icon: RotateCcw,
    title: "Hassle-Free Returns",
    description:
      "Not satisfied? Our 30-day return policy makes it easy to send products back — no questions asked.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    description:
      "Our team is available around the clock to help with orders, returns, and any questions you may have.",
  },
];

const TIMELINE = [
  { year: "2018", title: "Founded", description: "Started with a small warehouse and a big dream to deliver quality products." },
  { year: "2020", title: "Expanded Nationwide", description: "Opened distribution centers in 5 major cities across the country." },
  { year: "2022", title: "10K+ Customers", description: "Reached the milestone of serving over 10,000 satisfied customers." },
  { year: "2024", title: "New Product Lines", description: "Launched premium and organic product categories to serve diverse needs." },
];

export default function AboutPage() {
  return (
    <main className="bg-stone-50 text-stone-900 antialiased">
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[length:56px_56px] bg-[linear-gradient(#78716c_1px,transparent_1px),linear-gradient(90deg,#78716c_1px,transparent_1px)]" />
        <div className="h-1 w-full bg-lime-400" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 pt-20 pb-28 text-center">
          <span className="inline-flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-8">
            <span className="w-7 h-px bg-lime-500" />
            Our Story
            <span className="w-7 h-px bg-lime-500" />
          </span>
          <h1
            className="text-[clamp(3rem,8vw,6rem)] font-black leading-tight tracking-tight text-stone-900"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            MORE THAN<br />
            <span className="text-lime-500">JUST A STORE</span>
          </h1>
          <p className="mt-8 max-w-2xl mx-auto text-base lg:text-lg leading-relaxed text-stone-500 font-light">
            We started with one simple mission — to make high-quality products accessible to everyone, backed by honest service and fast delivery.
          </p>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 border-t border-stone-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-100">
            {STATS.map((s) => (
              <div key={s.label} className="py-8 px-6 first:pl-0 text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-black text-lime-500 leading-none">
                  {s.value}
                </div>
                <div className="mt-2 text-xs tracking-wide uppercase text-stone-400 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-16 py-28 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-16 lg:gap-28">
        <div className="lg:sticky lg:top-24 self-start">
          <span className="flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-5">
            <span className="w-6 h-px bg-lime-500" /> Who We Are
          </span>
          <h2 className="text-4xl lg:text-5xl font-black leading-tight text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            OUR<br />MISSION
          </h2>
          <div className="mt-5 w-10 h-1 bg-lime-400" />
        </div>
        <div>
          <div className="space-y-5 text-stone-500 font-light text-base lg:text-lg leading-relaxed">
            <p>
              We believe everyone deserves access to premium products without the premium price tag. Our team works directly with brands and authorized distributors to bring you authentic products at competitive prices.
            </p>
            <p>
              From the moment you place an order to the time it arrives at your doorstep, we ensure every step of the process is seamless, transparent, and reliable. Our climate-controlled, GMP-certified warehouses guarantee that every product reaches you in perfect condition.
            </p>
            <p>
              We are more than just an e-commerce platform — we are a community built on trust, quality, and a shared commitment to excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="border-t border-stone-100 bg-white py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="mb-16 text-center">
            <span className="flex items-center justify-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-5">
              <span className="w-6 h-px bg-lime-500" /> What We Stand For
              <span className="w-6 h-px bg-lime-500" />
            </span>
            <h2 className="text-4xl lg:text-5xl font-black leading-tight text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              OUR VALUES
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <article
                key={v.title}
                className="bg-stone-50 rounded-lg p-8 border border-stone-100 hover:border-lime-300 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-lime-400/20 flex items-center justify-center mb-5">
                  <v.icon size={22} className="text-lime-600" />
                </div>
                <h3 className="text-lg font-black text-stone-900 mb-2">{v.title}</h3>
                <p className="text-sm leading-relaxed text-stone-500 font-light">{v.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-16 py-28">
        <div className="mb-16">
          <span className="flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-5">
            <span className="w-6 h-px bg-lime-500" /> Milestones
          </span>
          <h2 className="text-4xl lg:text-5xl font-black leading-tight text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            OUR JOURNEY
          </h2>
        </div>

        <div className="relative border-l border-stone-200 ml-4 space-y-12">
          {TIMELINE.map((item) => (
            <div key={item.year} className="relative pl-10">
              <div className="absolute -left-[5px] top-1 w-3 h-3 rounded-full bg-lime-400 border-4 border-stone-50" />
              <span className="text-xs tracking-widest uppercase text-lime-600 font-medium">{item.year}</span>
              <h3 className="text-xl font-black text-stone-900 mt-1">{item.title}</h3>
              <p className="text-sm text-stone-500 font-light mt-1 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-stone-900 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 text-center">
          <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            READY TO SHOP?
          </h2>
          <p className="mt-4 max-w-lg mx-auto text-stone-400 font-light">
            Browse our collection and discover why thousands of customers trust us for quality products.
          </p>
          <a
            href="/products"
            className="inline-block mt-8 px-10 py-3.5 bg-lime-400 text-stone-900 text-xs tracking-widest uppercase font-bold hover:bg-lime-300 transition-colors duration-300"
          >
            Shop Now
          </a>
        </div>
      </section>
    </main>
  );
}
