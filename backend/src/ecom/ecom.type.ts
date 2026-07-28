import z from "zod";
import {
  createBannerSchema,
  updateBannerSchema,
  createFlashSaleSchema,
  updateFlashSaleSchema,
  createFlashSaleProductSchema,
  createFeaturedProductSchema,
} from "./ecom.validator";

export type Banner = typeof import("./ecom.table").bannerTable.$inferSelect;
export type BannerPayload = typeof import("./ecom.table").bannerTable.$inferInsert;

export type FlashSale = typeof import("./ecom.table").flashSaleTable.$inferSelect;
export type FlashSalePayload = typeof import("./ecom.table").flashSaleTable.$inferInsert;

export type FlashSaleProduct = typeof import("./ecom.table").flashSaleProductTable.$inferSelect;
export type FlashSaleProductPayload = typeof import("./ecom.table").flashSaleProductTable.$inferInsert;

export type FeaturedProduct = typeof import("./ecom.table").featuredProductTable.$inferSelect;
export type FeaturedProductPayload = typeof import("./ecom.table").featuredProductTable.$inferInsert;

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
export type CreateFlashSaleInput = z.infer<typeof createFlashSaleSchema>;
export type UpdateFlashSaleInput = z.infer<typeof updateFlashSaleSchema>;
export type CreateFlashSaleProductInput = z.infer<typeof createFlashSaleProductSchema>;
export type CreateFeaturedProductInput = z.infer<typeof createFeaturedProductSchema>;
