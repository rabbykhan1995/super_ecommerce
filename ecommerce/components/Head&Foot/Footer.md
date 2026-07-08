# Footer Component Documentation

## Overview
The `Footer` component is a responsive site footer for the e-commerce application. It displays brand information, navigation links, customer service links, a newsletter subscription form, social media icons, and legal links.

## Location
`components/Head&Foot/Footer.tsx`

## Features

### 1. Brand & About Section
- **BrandLogo** - Custom brand logo component
- Company description about product sourcing and warehouses
- Contact information:
  - Address: House# 44, Rd No. 2/A, Dhanmondi, Dhaka 1209
  - Phone: +880 1234-567890
  - Email: support@example.com

### 2. Quick Links
Navigation links to key pages:
- About Us
- All Products
- Nutrition Plans
- Track Order
- FAQ

### 3. Customer Service
Support-related links:
- Contact Us
- Shipping Policy
- Return & Refund
- Warranty
- Support Center

### 4. Newsletter Subscription
- Email input field with placeholder
- Submit button with Send icon
- Social media icons (YouTube, Facebook, Instagram, Twitter)

### 5. Bottom Bar
- Copyright notice: "© 2026 Jeff Nippard Fitness. All Rights Reserved."
- Legal links: Privacy Policy | Terms of Service | Sitemap

## Dependencies
- `lucide-react` - Icons (Facebook, Instagram, Twitter, Youtube, MapPin, Mail, Phone, Send)
- `next/link` - Navigation links
- `@/lib/font` - Custom font (shadowsIntoLight)
- `../Logos/BrandLogo` - Brand logo component

## Styling
- **Background**: Dark (`bg-[#1a1c1e]`)
- **Primary Text**: Light gray (`text-[#c9cbcc]`)
- **Accent Color**: Red (`#F7311E`) for icons and hover states
- **Responsive**: Grid layout (2 columns mobile, 4 columns desktop)
- **Typography**: Uppercase headings with tracking, small text sizes (12-13px)

## Usage
```tsx
import Footer from '@/components/Head&Foot/Footer';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
```

## Notes
- Marked as `"use client"` for client-side interactivity
- All links currently use placeholder `#` hrefs - should be updated to actual routes
- Newsletter form is UI only - no submission handler implemented
- Social media links use placeholder `#` hrefs