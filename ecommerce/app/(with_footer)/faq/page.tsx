'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQ_DATA = [
  {
    category: 'Orders & Payment',
    items: [
      {
        question: 'How do I place an order?',
        answer:
          'Simply browse our products, add items to your cart, and proceed to checkout. You can pay using bKash, Nagad, Rocket, or cash on delivery.',
      },
      {
        question: 'Can I modify or cancel my order after placing it?',
        answer:
          'Orders can be modified or cancelled within 2 hours of placement. After that, the order enters processing and cannot be changed. Please contact our support team immediately if you need assistance.',
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept bKash, Nagad, Rocket, Visa, Mastercard, and Cash on Delivery (COD). All online payments are secured with SSL encryption.',
      },
      {
        question: 'Is Cash on Delivery available?',
        answer:
          'Yes, COD is available for orders within Dhaka city. For orders outside Dhaka, we require pre-payment via bKash, Nagad, or card.',
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    items: [
      {
        question: 'How long does delivery take?',
        answer:
          'Inside Dhaka: 1–2 business days. Outside Dhaka: 3–5 business days. You will receive a tracking number once your order is shipped.',
      },
      {
        question: 'Do you ship nationwide?',
        answer:
          'Yes, we deliver to all 64 districts across Bangladesh through our trusted courier partners.',
      },
      {
        question: 'How can I track my order?',
        answer:
          'Once your order is dispatched, you will receive an SMS and email with a tracking link. You can also track your order from your account dashboard.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      {
        question: 'What is your return policy?',
        answer:
          'We offer a 30-day return policy. Items must be unused, in original packaging, and in the same condition you received them. Some categories like perishables and personal care items are non-returnable.',
      },
      {
        question: 'How do I request a refund?',
        answer:
          'Contact our support team with your order number and reason for return. Once we receive and inspect the item, your refund will be processed within 5–7 business days.',
      },
      {
        question: 'Do I pay for return shipping?',
        answer:
          'If the return is due to a defective or wrong product, we cover the shipping cost. For change-of-mind returns, the customer bears the return shipping fee.',
      },
    ],
  },
  {
    category: 'Account & Support',
    items: [
      {
        question: 'Do I need an account to place an order?',
        answer:
          'No, you can checkout as a guest. However, creating an account lets you track orders, save addresses, and enjoy a faster checkout experience.',
      },
      {
        question: 'How do I contact customer support?',
        answer:
          'You can reach us via the Contact Us page, by phone at +880 1234-567890, or by email at support@example.com. We are available Sunday–Thursday, 9 AM–6 PM.',
      },
      {
        question: 'How do I reset my password?',
        answer:
          'Click "Forgot Password" on the login page, enter your registered email, and follow the link sent to your inbox to set a new password.',
      },
    ],
  },
]

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-white hover:bg-stone-50 transition-colors"
      >
        <span className="text-sm font-medium text-stone-900 pr-4">{question}</span>
        <ChevronDown
          size={18}
          className={`text-stone-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-60' : 'max-h-0'}`}
      >
        <div className="px-6 pb-5 text-sm text-stone-500 font-light leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 text-center">
          <span className="inline-flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-6">
            <span className="w-7 h-px bg-lime-500" />
            Help Center
            <span className="w-7 h-px bg-lime-500" />
          </span>
          <h1
            className="text-4xl lg:text-5xl font-black text-stone-900 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            FREQUENTLY ASKED
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-stone-500 font-light text-base lg:text-lg leading-relaxed">
            Find answers to the most common questions about orders, shipping, returns, and more.
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-16 py-16 lg:py-24 space-y-16">
        {FAQ_DATA.map((section) => (
          <div key={section.category}>
            <h2 className="text-2xl font-black text-stone-900 mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {section.category}
            </h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <AccordionItem key={item.question} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-white border-t border-stone-100 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 text-center">
          <h3 className="text-2xl font-black text-stone-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            STILL HAVE QUESTIONS?
          </h3>
          <p className="mt-3 text-stone-500 font-light">
            Our support team is here to help. Reach out anytime.
          </p>
          <a
            href="/contact"
            className="inline-block mt-6 px-8 py-3 bg-stone-900 text-white text-xs tracking-widest uppercase font-medium hover:bg-lime-400 hover:text-stone-900 transition-colors duration-300"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
