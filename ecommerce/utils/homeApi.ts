import type { EcomProduct, PaginatedResponse, ApiResponse } from "@/types/product.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export type FlashSaleInfo = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export async function getActiveFlashSale(): Promise<FlashSaleInfo | null> {
  const res = await fetch(`${API_URL}/ecom/flash-sale/active`, {
    next: { tags: ["home-flash-products"], revalidate: 60 },
  });

  if (!res.ok) return null;

  const response: ApiResponse<FlashSaleInfo | null> = await res.json();
  return response.data;
}

export async function getFlashProducts(): Promise<EcomProduct[]> {
  const res = await fetch(`${API_URL}/ecom/flash-products`, {
    next: { tags: ["home-flash-products"], revalidate: 3600 },
  });

  if (!res.ok) return [];

  const response: ApiResponse<EcomProduct[]> = await res.json();
  return response.data;
}

export async function getFeaturedProducts(): Promise<EcomProduct[]> {
  const res = await fetch(`${API_URL}/ecom/featured`, {
    next: { tags: ["home-featured-products"], revalidate: 3600 },
  });

  if (!res.ok) return [];

  const response: ApiResponse<EcomProduct[]> = await res.json();
  return response.data;
}

export async function getOfferProducts(): Promise<PaginatedResponse<EcomProduct>> {
  const res = await fetch(`${API_URL}/ecom/offers?limit=10&sort=bestSelling`, {
    next: { tags: ["home-offer-products"], revalidate: 3600 },
  });

  if (!res.ok) {
    return { items: [], total: 0, page: 1, limit: 10 };
  }

  const response: ApiResponse<PaginatedResponse<EcomProduct>> = await res.json();
  return response.data;
}
