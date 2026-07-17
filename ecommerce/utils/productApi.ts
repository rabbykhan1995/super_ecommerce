import axios from "axios";
import type {
  EcomProduct,
  EcomProductFilters,
  PaginatedResponse,
  ApiResponse,
  CategoryListItem,
  BrandListItem,
  EcomVariantDetail,
} from "@/types/product.types";

const productApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

function buildFilterParams(filters: EcomProductFilters): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.page) params.page = String(filters.page);
  if (filters.limit) params.limit = String(filters.limit);
  if (filters.search) params.search = filters.search;
  if (filters.sort) params.sort = filters.sort;
  if (filters.featured !== undefined) params.featured = String(filters.featured);
  if (filters.inStock !== undefined) params.inStock = String(filters.inStock);
  if (filters.published !== undefined) params.published = String(filters.published);
  if (filters.minPrice !== undefined) params.minPrice = String(filters.minPrice);
  if (filters.maxPrice !== undefined) params.maxPrice = String(filters.maxPrice);
  if (filters.minRating !== undefined) params.minRating = String(filters.minRating);

  if (filters.categoryID?.length) {
    params.categoryID = filters.categoryID.join(",");
  }
  if (filters.brandID?.length) {
    params.brandID = filters.brandID.join(",");
  }
  if (filters.unitID?.length) {
    params.unitID = filters.unitID.join(",");
  }

  return params;
}

export async function fetchProducts(
  filters: EcomProductFilters = {},
): Promise<PaginatedResponse<EcomProduct>> {
  const res = await productApi.get<ApiResponse<PaginatedResponse<EcomProduct>>>(
    "/product/ecom-product-list",
    { params: buildFilterParams(filters) },
  );
  return res.data.data;
}

export async function fetchCategories(): Promise<CategoryListItem[]> {
  const res = await productApi.get<ApiResponse<CategoryListItem[]>>("/category/list");
  return res.data.data;
}

export async function fetchBrands(): Promise<BrandListItem[]> {
  const res = await productApi.get<ApiResponse<BrandListItem[]>>("/brand/list");
  return res.data.data;
}

export async function fetchVariantsByProduct(productID: number): Promise<EcomVariantDetail[]> {
  const res = await productApi.get<ApiResponse<EcomVariantDetail[]>>(
    `/product/ecom-variants/${productID}`,
  );
  return res.data.data;
}
