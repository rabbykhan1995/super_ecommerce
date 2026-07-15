"use client";

import { useEffect, useState } from "react";
import Hero from "@/components/Sections/Hero";
import FlashSaleProductSlider from "@/components/Sliders/FlashProductuSlider";
import OfferProducts from "@/components/Sections/OfferProducts";
import { fetchProducts } from "@/utils/productApi";
import type { EcomProduct } from "@/types/product.types";

const DUMMY_PRODUCTS: EcomProduct[] = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphone",
    slug: "wireless-bluetooth-headphone",
    description: null,
    shortDescription: null,
    thumbnail: "https://picsum.photos/seed/product1/400/400",
    salePrice: 45.99,
    stock: 120,
    totalSold: 120,
    averageRating: 4.5,
    totalReviews: 24,
    featured: true,
    isPublished: true,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: null,
    category: null,
    unit: null,
    variants: [],
  },
  {
    id: 2,
    name: "Smart Watch Series 5",
    slug: "smart-watch-series-5",
    description: null,
    shortDescription: null,
    thumbnail: "https://picsum.photos/seed/product2/400/400",
    salePrice: 59.0,
    stock: 88,
    totalSold: 88,
    averageRating: 4.2,
    totalReviews: 18,
    featured: false,
    isPublished: true,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: null,
    category: null,
    unit: null,
    variants: [],
  },
  {
    id: 3,
    name: "Men's Running Sneakers",
    slug: "mens-running-sneakers",
    description: null,
    shortDescription: null,
    thumbnail: "https://picsum.photos/seed/product3/400/400",
    salePrice: 32.5,
    stock: 210,
    totalSold: 210,
    averageRating: 4.7,
    totalReviews: 45,
    featured: true,
    isPublished: true,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: null,
    category: null,
    unit: null,
    variants: [],
  },
  {
    id: 4,
    name: "Portable Bluetooth Speaker",
    slug: "portable-bluetooth-speaker",
    description: null,
    shortDescription: null,
    thumbnail: "https://picsum.photos/seed/product4/400/400",
    salePrice: 22.99,
    stock: 65,
    totalSold: 65,
    averageRating: 4.1,
    totalReviews: 12,
    featured: false,
    isPublished: true,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: null,
    category: null,
    unit: null,
    variants: [],
  },
  {
    id: 5,
    name: "Leather Backpack Bag",
    slug: "leather-backpack-bag",
    description: null,
    shortDescription: null,
    thumbnail: "https://picsum.photos/seed/product5/400/400",
    salePrice: 38.0,
    stock: 150,
    totalSold: 150,
    averageRating: 4.6,
    totalReviews: 32,
    featured: false,
    isPublished: true,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: null,
    category: null,
    unit: null,
    variants: [],
  },
  {
    id: 6,
    name: "Sunglasses UV Protection",
    slug: "sunglasses-uv-protection",
    description: null,
    shortDescription: null,
    thumbnail: "https://picsum.photos/seed/product6/400/400",
    salePrice: 15.99,
    stock: 45,
    totalSold: 45,
    averageRating: 4.0,
    totalReviews: 8,
    featured: false,
    isPublished: true,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: null,
    category: null,
    unit: null,
    variants: [],
  },
  {
    id: 7,
    name: "Digital Camera 4K",
    slug: "digital-camera-4k",
    description: null,
    shortDescription: null,
    thumbnail: "https://picsum.photos/seed/product7/400/400",
    salePrice: 199.0,
    stock: 30,
    totalSold: 30,
    averageRating: 4.8,
    totalReviews: 15,
    featured: true,
    isPublished: true,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: null,
    category: null,
    unit: null,
    variants: [],
  },
  {
    id: 8,
    name: "Gaming Mechanical Keyboard",
    slug: "gaming-mechanical-keyboard",
    description: null,
    shortDescription: null,
    thumbnail: "https://picsum.photos/seed/product8/400/400",
    salePrice: 49.99,
    stock: 95,
    totalSold: 95,
    averageRating: 4.4,
    totalReviews: 22,
    featured: false,
    isPublished: true,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: null,
    category: null,
    unit: null,
    variants: [],
  },
  {
    id: 9,
    name: "Fitness Tracker Band",
    slug: "fitness-tracker-band",
    description: null,
    shortDescription: null,
    thumbnail: "https://picsum.photos/seed/product9/400/400",
    salePrice: 18.5,
    stock: 180,
    totalSold: 180,
    averageRating: 4.3,
    totalReviews: 28,
    featured: false,
    isPublished: true,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: null,
    category: null,
    unit: null,
    variants: [],
  },
  {
    id: 10,
    name: "Wireless Charging Pad",
    slug: "wireless-charging-pad",
    description: null,
    shortDescription: null,
    thumbnail: "https://picsum.photos/seed/product10/400/400",
    salePrice: 12.99,
    stock: 70,
    totalSold: 70,
    averageRating: 4.2,
    totalReviews: 14,
    featured: false,
    isPublished: true,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    brand: null,
    category: null,
    unit: null,
    variants: [],
  },
];

export default function Home() {
  const [flashProducts, setFlashProducts] = useState<EcomProduct[]>([]);
  const [offerProducts, setOfferProducts] = useState<EcomProduct[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const [flash, offer] = await Promise.all([
          fetchProducts({ limit: 12, sort: "latest", published: true }),
          fetchProducts({ limit: 10, sort: "bestSelling", published: true }),
        ]);
        setFlashProducts(flash.items.length > 0 ? flash.items : DUMMY_PRODUCTS.slice(0, 12));
        setOfferProducts(offer.items.length > 0 ? offer.items : DUMMY_PRODUCTS.slice(0, 10));
      } catch (err) {
        console.error("Failed to fetch products, using dummy data", err);
        setFlashProducts(DUMMY_PRODUCTS.slice(0, 12));
        setOfferProducts(DUMMY_PRODUCTS.slice(0, 10));
      }
    };
    loadProducts();
  }, []);

  return (
    <div className="">
      <div className="relative w-full overflow-hidden mb-10">
        <Hero />
        <FlashSaleProductSlider products={flashProducts} />
      </div>
      <OfferProducts products={offerProducts} />
    </div>
  );
}
