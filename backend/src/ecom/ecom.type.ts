import z from "zod";
import {
  createBannerSchema,
  updateBannerSchema,
  createFlashSaleSchema,
  updateFlashSaleSchema,
  createFlashSaleProductSchema,
  createFeaturedProductSchema,
} from "./ecom.validator";

export type Banner = typeof import("./banner.table").bannerTable.$inferSelect;
export type BannerPayload = typeof import("./banner.table").bannerTable.$inferInsert;

export type FlashSale = typeof import("./flash_sale.table").flashSaleTable.$inferSelect;
export type FlashSalePayload = typeof import("./flash_sale.table").flashSaleTable.$inferInsert;

export type FlashSaleProduct = typeof import("./flash_sale.table").flashSaleProductTable.$inferSelect;
export type FlashSaleProductPayload = typeof import("./flash_sale.table").flashSaleProductTable.$inferInsert;

export type FeaturedProduct = typeof import("./featured_product.table").featuredProductTable.$inferSelect;
export type FeaturedProductPayload = typeof import("./featured_product.table").featuredProductTable.$inferInsert;

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
export type CreateFlashSaleInput = z.infer<typeof createFlashSaleSchema>;
export type UpdateFlashSaleInput = z.infer<typeof updateFlashSaleSchema>;
export type CreateFlashSaleProductInput = z.infer<typeof createFlashSaleProductSchema>;
export type CreateFeaturedProductInput = z.infer<typeof createFeaturedProductSchema>;
