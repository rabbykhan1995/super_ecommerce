'use client'

import React, { useState } from 'react'
import api from '@/utils/apiconfig'
import toast, { Toaster } from 'react-hot-toast'

interface ContactForm {
  name: string
  email: string
  message: string
}
// hello


const Page = () => {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    message: ''
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>): Promise<void> =>  {
    e.preventDefault()

    if (!form.name || !form.email || !form.message) {
      toast.error('All fields are required')
      return
    }



      const { data } = await api.post('/contact', form);
   
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <Toaster position="top-right" />

      <div className="w-full max-w-2xl bg-white text-black border-gray-300 rounded-2xl shadow-sm p-10">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Contact Us
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block mb-2 font-medium">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block mb-2 font-medium">
              Message
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              placeholder="Write your message..."
              className="w-full border border-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition resize-none"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-white hover:text-black border border-black transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Page