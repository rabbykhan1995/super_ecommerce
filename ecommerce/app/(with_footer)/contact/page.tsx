'use client'

import React, { useState } from 'react'
import api from '@/utils/apiconfig'
import toast, { Toaster } from 'react-hot-toast'
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react'

interface ContactForm {
  name: string
  email: string
  message: string
}

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: 'Visit Us',
    value: 'House# 44, Rd No. 2/A, Dhanmondi, Dhaka 1209',
  },
  {
    icon: Phone,
    label: 'Call Us',
    value: '+880 1234-567890',
  },
  {
    icon: Mail,
    label: 'Email Us',
    value: 'support@example.com',
  },
  {
    icon: Clock,
    label: 'Working Hours',
    value: 'Sun — Thu, 9:00 AM — 6:00 PM',
  },
]

const Page = () => {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!form.name || !form.email || !form.message) {
      toast.error('All fields are required')
      return
    }

    try {
      setLoading(true)
      await api.post('/contact', form)
      toast.success('Message sent successfully!')
      setForm({ name: '', email: '', message: '' })
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 text-center">
          <span className="inline-flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-6">
            <span className="w-7 h-px bg-lime-500" />
            Get In Touch
            <span className="w-7 h-px bg-lime-500" />
          </span>
          <h1 className="text-4xl lg:text-5xl font-black text-stone-900 tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            CONTACT US
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-stone-500 font-light text-base lg:text-lg leading-relaxed">
            Have a question about an order, a product, or anything else? We&apos;re here to help.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20">
          {/* Left Column — Contact Info */}
          <div>
            <span className="flex items-center gap-3 text-xs tracking-widest uppercase text-lime-600 font-medium mb-5">
              <span className="w-6 h-px bg-lime-500" /> Reach Out
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-stone-900 leading-tight mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              WE&apos;D LOVE<br />TO HEAR FROM YOU
            </h2>

            <div className="space-y-6">
              {CONTACT_INFO.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-lime-400/20 flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-lime-600" />
                  </div>
                  <div>
                    <p className="text-xs tracking-wide uppercase text-stone-400 font-medium">{item.label}</p>
                    <p className="text-stone-700 text-sm mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Embed Placeholder */}
            <div className="mt-10 w-full h-48 bg-stone-200 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.847!2d90.374!3d23.746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ0JzQ1LjYiTiA5MMKwMjInMjYuNCJF!5e0!3m2!1sen!2sbd!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right Column — Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 lg:p-10">
            <h3 className="text-2xl font-black text-stone-900 mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Send a Message
            </h3>
            <p className="text-sm text-stone-400 mb-8">Fill out the form below and we&apos;ll get back to you shortly.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-stone-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-stone-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all placeholder:text-stone-400"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-stone-700">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="How can we help you?"
                  className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all resize-none placeholder:text-stone-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 text-white py-3.5 rounded-lg font-semibold text-sm tracking-wide uppercase flex items-center justify-center gap-2 hover:bg-lime-400 hover:text-stone-900 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
