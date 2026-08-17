import { z } from "zod";
 
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
    .string("userID must be a valid uuid")
    .nullable()
    .optional(),
});
 

 
/**
 * UPDATE — existing device row update korar somoy (login/logout/token refresh).
 * Sob field optional, kintu deviceID diyei row match kora hoy tai seta required rakhlam
 * (route param theke o nite paro, tahole body theke bad diyo).
 * At least ekta updatable field thakte hobe - noile empty update request reject kora uchit.
 */
export const updateNotificationSchema = z
  .object({
    deviceID: z
      .string()
      .min(1, "deviceID cannot be empty")
      .max(255).optional(),
 
    pushToken: z.string().min(1).max(512).optional(),
 
    platform: platformEnum.optional(),
 
    appVersion: z.string().max(50).nullable().optional(),
 
    // login -> uuid pathabe, logout -> explicitly null pathabe
    userID: z.string().uuid("userID must be a valid uuid").nullable().optional(),
 
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      const { deviceID, ...rest } = data;
      return Object.values(rest).some((v) => v !== undefined);
    },
    { message: "At least one updatable field must be provided" },
  );