'use client'

import React from "react";
import { Truck, Clock, MapPin, AlertCircle } from "lucide-react";

const SHIPPING_INFO = [
  {
    icon: Truck,
    title: "Nationwide Delivery",
    description:
      "We deliver to all 64 districts across Bangladesh through our trusted courier partners including Pathao, Paperfly, and Sundarban.",
  },
  {
    icon: Clock,
    title: "Fast Processing",
    description:
      "Orders placed before 12:00 PM on business days are processed and dispatched the same day. Orders after 12:00 PM ship the next business day.",
  },
  {
    icon: MapPin,
    title: "Track Your Order",
    description:
      "You will receive an SMS and email with a tracking link once your order is dispatched. You can also track from your account dashboard.",
  },
  {
    icon: AlertCircle,
    title: "Delivery Issues",
    description:
      "If your package arrives damaged or you receive the wrong item, contact us within 48 hours for an immediate resolution.",
  },
];

const ZONES = [
  { zone: "Inside Dhaka", time: "1–2 Business Days", cost: "৳80" },
  { zone: "Dhaka Suburbs", time: "2–3 Business Days", cost: "৳100" },
  { zone: "Outside Dhaka", time: "3–5 Business Days", cost: "৳120" },
  { zone: "Remote Areas", time: "5–7 Business Days", cost: "৳150" },
];

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 text-center">
          <span className="inline-flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-6">
            <span className="w-7 h-px bg-lime-500" />
            Delivery Information
            <span className="w-7 h-px bg-lime-500" />
          </span>
          <h1
            className="text-4xl lg:text-5xl font-black text-stone-900 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            SHIPPING POLICY
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-stone-500 font-light text-base lg:text-lg leading-relaxed">
            Everything you need to know about how we ship your orders.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 lg:py-24">
        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {SHIPPING_INFO.map((item) => (
            <article
              key={item.title}
              className="bg-white rounded-lg p-6 border border-stone-100"
            >
              <div className="w-11 h-11 rounded-full bg-lime-400/20 flex items-center justify-center mb-4">
                <item.icon size={20} className="text-lime-600" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">{item.title}</h3>
              <p className="text-sm text-stone-500 font-light leading-relaxed">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        {/* Shipping Rates Table */}
        <div className="max-w-4xl mx-auto">
          <span className="flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-5">
            <span className="w-6 h-px bg-lime-500" /> Shipping Rates
          </span>
          <h2
            className="text-3xl lg:text-4xl font-black text-stone-900 leading-tight mb-8"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            DELIVERY ZONES & COSTS
          </h2>

          <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
            <div className="grid grid-cols-3 bg-stone-900 text-white text-xs tracking-widest uppercase font-medium">
              <div className="px-6 py-4">Zone</div>
              <div className="px-6 py-4 text-center">Estimated Time</div>
              <div className="px-6 py-4 text-right">Shipping Cost</div>
            </div>
            {ZONES.map((z, i) => (
              <div
                key={z.zone}
                className={`grid grid-cols-3 text-sm ${i !== ZONES.length - 1 ? 'border-b border-stone-100' : ''}`}
              >
                <div className="px-6 py-4 font-medium text-stone-900">{z.zone}</div>
                <div className="px-6 py-4 text-center text-stone-500">{z.time}</div>
                <div className="px-6 py-4 text-right text-stone-900 font-medium">{z.cost}</div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-stone-400 font-light">
            * Free shipping on orders above ৳2,000. Shipping costs may vary during promotional periods.
          </p>
        </div>

        {/* Additional Policies */}
        <div className="max-w-4xl mx-auto mt-20">
          <span className="flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-5">
            <span className="w-6 h-px bg-lime-500" /> Good to Know
          </span>
          <h2
            className="text-3xl lg:text-4xl font-black text-stone-900 leading-tight mb-8"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            IMPORTANT NOTES
          </h2>

          <div className="space-y-4">
            {[
              "Orders are dispatched on business days only (Sunday–Thursday). Orders placed on Friday or Saturday will be processed on the next working day.",
              "Delivery times are estimates and may be affected by holidays, natural disasters, or courier delays.",
              "Please ensure your shipping address and phone number are correct. We are not responsible for orders shipped to incorrect addresses provided by the customer.",
              "For bulk or wholesale orders, shipping costs and timelines may differ. Contact us for a custom quote.",
              "All shipments are insured against damage. If your package arrives damaged, do not accept it or contact us within 48 hours.",
            ].map((note, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-5 border border-stone-100">
                <div className="w-6 h-6 rounded-full bg-lime-400/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-lime-600">{i + 1}</span>
                </div>
                <p className="text-sm text-stone-600 font-light leading-relaxed">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
