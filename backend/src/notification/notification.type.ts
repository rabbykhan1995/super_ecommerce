import z from "zod";
import { notificationTable, platformEnum } from "./notification.table";
import { createNotificationSchema, updateNotificationSchema } from "./notification.validator";

export type DevicePlatformType = typeof platformEnum.enumValues[number]
export type Notification = typeof notificationTable.$inferSelect;
export type NotificationPayload = typeof notificationTable.$inferInsert;

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;

export type SendNotificationParams = {
  userID?: string;
  contactID?: number;
  deviceID?: string; // guest/non-logged-in device - userID na thakleo direct pathano jay
  title: string;
  body: string;
  data?: Record<string, unknown>;
};