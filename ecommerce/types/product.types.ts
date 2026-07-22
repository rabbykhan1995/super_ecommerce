export type FullProduct = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  thumbnail: string | null;
  thumbnailFileId: string | null;
  video: string | null;
  stock: number;
  salePrice: number;
  purchasePrice: number;
  sku: string | null;
  status: string;
  featured: boolean;
  isPublished: boolean;
  manageStock: boolean;
  averageRating: number;
  totalReviews: number;
  totalSold: number;
  createdAt: Date;
  updatedAt: Date;
  brand: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
  unit: { id: number; name: string } | null;
  variants: ProductVariant[];
};

export type ProductVariant = {
  id: number;
  productID: number;
  salePrice: number | null;
  discountPrice: number | null;
  stock: number | null;
  barcode: string;
  weight: number | null;
  attributes: { name: string; value: string }[];
  images?: string[];
  imageFileIds?: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CardProduct = {
  id: number;
  thumbnail: string | null;
  averageRating: number;
  name: string;
  slug: string;
  shortDescription?: string | null;
  totalReviews?: number;
  salePrice?: number;
  discountPrice?: number;
};

// ---- Ecom Product Types (for /ecom-product-list) ----

export type EcomBrand = {
  id: number;
  name: string;
};

export type EcomCategory = {
  id: number;
  name: string;
};

export type EcomUnit = {
  id: number;
  name: string;
};

export type EcomVariant = {
  id: number;
  salePrice: number | null;
  stock: number | null;
  barcode: string;
  attributes: Array<{ name: string; value: string }>;
  createdAt: Date;
};

export type EcomVariantDetail = {
  id: number;
  productID: number;
  salePrice: number;
  discountPrice:number;
  stock: number | null;
  barcode: string;
  weight: number | null;
  attributes: Array<{ name: string; value: string }>;
  images: string[];
  imageFileIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type EcomProduct = {
  id: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  thumbnail: string | null;
  salePrice: number;
  stock: number;
  totalSold: number;
  averageRating: number;
  totalReviews: number;
  discountPrice: number | null;
  video?:string;
};

export type EcomProductFilters = {
  page?: number;
  limit?: number;
  search?: string;
  categoryID?: number[];
  brandID?: number[];
  unitID?: number[];
  featured?: boolean;
  inStock?: boolean;
  published?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?:
    | "latest"
    | "oldest"
    | "priceAsc"
    | "priceDesc"
    | "nameAsc"
    | "nameDesc"
    | "bestSelling";
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type CategoryListItem = {
  id: number;
  name: string;
  slug?: string;
  parentID?: number | null;
};

export type BrandListItem = {
  id: number;
  name: string;
  slug?: string;
};
