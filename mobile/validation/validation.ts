import { z } from "zod";

export const checkoutOrderSchema = z.object({
  shipping: z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().optional(),
    area: z.string().optional(),
  }),
  note: z.string().optional(),
  paymentMethod: z.enum(["stripe"]),
});

export const checkoutMobileSchema = z.object({
  address: z
    .string()
    .min(6, "address must be at least 6 characters").nonempty(),
  mobile: z
    .string()
    .min(1, "mobile is required")
    .refine((val) => {
      // email regex
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // mobile regex (Bangladesh 01XXXXXXXXX)
      const mobileRegex =
        /^(?:\+88)?01[3-9]\d{8}$/;

      return emailRegex.test(val) || mobileRegex.test(val);
    }, "mobile must be a valid number"),
});
 
// Keep in sync with your Drizzle enum
export const platformEnum = z.enum(["android", "ios", "windows", "linux"]);
 
/**
 * CREATE — device register/upsert korar somoy client theke ja pathabe.
 * id, createdAt, updatedAt, lastUsedAt -> server generate/manage kore, client theke asha uchit na.
 * userID -> optional/nullable, login er age null thakte pare.
 */
export const createNotificationSchema = z.object({
  deviceID: z
    .string( "deviceID is required" )
    .min(1, "deviceID cannot be empty")
    .max(255),
 
  pushToken: z
    .string( "pushToken is required" )
    .min(1, "pushToken cannot be empty")
    .max(512),
 
  platform: platformEnum,
 
  appVersion: z
    .string()
    .max(50)
    .nullable()
    .optional(),
 
  userID: z
    .string()
    .uuid("userID must be a valid uuid")
    .nullable()
    .optional(),
});
 