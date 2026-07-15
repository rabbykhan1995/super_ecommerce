'use client'

import React from "react";
import { RotateCcw, PackageX, CreditCard, AlertCircle } from "lucide-react";

const POLICY_HIGHLIGHTS = [
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    description:
      "You have 30 days from the date of delivery to request a return for most items.",
  },
  {
    icon: PackageX,
    title: "Original Condition",
    description:
      "Items must be unused, in original packaging, and with all tags attached to qualify for a return.",
  },
  {
    icon: CreditCard,
    title: "Refund Timeline",
    description:
      "Refunds are processed within 5–7 business days after we receive and inspect the returned item.",
  },
  {
    icon: AlertCircle,
    title: "Non-Returnable Items",
    description:
      "Perishable goods, personal care items, undergarments, and clearance sale items cannot be returned.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Submit a Request",
    description:
      "Contact our support team via the Contact Us page or email us at support@example.com with your order number and reason for return.",
  },
  {
    step: "02",
    title: "Get Approval",
    description:
      "Our team will review your request and respond within 24 hours with return instructions and a return authorization number.",
  },
  {
    step: "03",
    title: "Ship the Item",
    description:
      "Pack the item securely in its original packaging and ship it to the address provided. Use a trackable shipping method for your protection.",
  },
  {
    step: "04",
    title: "Receive Your Refund",
    description:
      "Once we receive and inspect the item, your refund will be processed to your original payment method within 5–7 business days.",
  },
];

const FAQS = [
  {
    q: "Can I exchange an item instead of returning it?",
    a: "Yes, exchanges are available for items of equal or lesser value. Contact us within 30 days of delivery to arrange an exchange.",
  },
  {
    q: "What if I received a damaged or defective item?",
    a: "We're sorry about that! Contact us within 48 hours with photos of the damage. We will arrange a free pickup and send a replacement or full refund.",
  },
  {
    q: "Do I pay for return shipping?",
    a: "If the return is due to a defective, damaged, or wrong product, we cover the full shipping cost. For change-of-mind returns, the customer is responsible for return shipping fees.",
  },
  {
    q: "How will I receive my refund?",
    a: "Refunds are credited back to your original payment method. For COD orders, we will transfer the amount to your bKash, Nagad, or bank account as per your preference.",
  },
  {
    q: "Are sale or clearance items eligible for return?",
    a: "Items purchased during clearance sales are final sale and cannot be returned or exchanged unless they are defective.",
  },
];

export default function ReturnRefundPolicyPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 text-center">
          <span className="inline-flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-6">
            <span className="w-7 h-px bg-lime-500" />
            Hassle-Free
            <span className="w-7 h-px bg-lime-500" />
          </span>
          <h1
            className="text-4xl lg:text-5xl font-black text-stone-900 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            RETURN & REFUND<br />POLICY
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-stone-500 font-light text-base lg:text-lg leading-relaxed">
            We want you to love every purchase. If something isn&apos;t right, our return process makes it easy.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 lg:py-24">
        {/* Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {POLICY_HIGHLIGHTS.map((item) => (
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

        {/* Return Process Steps */}
        <div className="max-w-4xl mx-auto mb-20">
          <span className="flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-5">
            <span className="w-6 h-px bg-lime-500" /> How It Works
          </span>
          <h2
            className="text-3xl lg:text-4xl font-black text-stone-900 leading-tight mb-10"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            RETURN PROCESS
          </h2>

          <div className="space-y-6">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className="flex items-start gap-6 bg-white rounded-xl p-6 border border-stone-100"
              >
                <div className="w-12 h-12 rounded-full bg-lime-400/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-black text-lime-600">{s.step}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">{s.title}</h3>
                  <p className="text-sm text-stone-500 font-light mt-1 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility */}
        <div className="max-w-4xl mx-auto mb-20">
          <span className="flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-5">
            <span className="w-6 h-px bg-lime-500" /> Eligibility
          </span>
          <h2
            className="text-3xl lg:text-4xl font-black text-stone-900 leading-tight mb-8"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            WHAT CAN BE RETURNED?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-4">Eligible for Return</h3>
              <ul className="space-y-3">
                {[
                  "Unused items in original packaging",
                  "Items with all tags and labels attached",
                  "Defective or damaged products",
                  "Wrong item received",
                  "Items within 30-day window",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-stone-600 font-light">
                    <span className="text-lime-500 font-bold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-stone-100">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-4">Not Eligible for Return</h3>
              <ul className="space-y-3">
                {[
                  "Perishable goods (food, supplements)",
                  "Personal care and hygiene products",
                  "Undergarments and swimwear",
                  "Clearance / sale items",
                  "Gift cards",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-stone-600 font-light">
                    <span className="text-red-400 font-bold mt-0.5">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <span className="flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-5">
            <span className="w-6 h-px bg-lime-500" /> Common Questions
          </span>
          <h2
            className="text-3xl lg:text-4xl font-black text-stone-900 leading-tight mb-8"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            RETURN FAQs
          </h2>

          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-white rounded-xl p-6 border border-stone-100">
                <h3 className="text-sm font-bold text-stone-900">{faq.q}</h3>
                <p className="text-sm text-stone-500 font-light mt-2 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-stone-900 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 text-center">
          <h3 className="text-2xl font-black text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            NEED HELP WITH A RETURN?
          </h3>
          <p className="mt-3 text-stone-400 font-light text-sm">
            Our support team is ready to assist you every step of the way.
          </p>
          <a
            href="/contact"
            className="inline-block mt-6 px-8 py-3 bg-lime-400 text-stone-900 text-xs tracking-widest uppercase font-bold hover:bg-lime-300 transition-colors duration-300"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
