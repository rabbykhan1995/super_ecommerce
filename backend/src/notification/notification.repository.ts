import { eq } from "drizzle-orm";
import db,{ QueryClient } from "../../drizzle/src";
import { notificationTable } from "./notification.table";
import { CreateNotificationInput, UpdateNotificationInput } from "./notification.type";

export default class NotificationRepo{
static async  create(data: CreateNotificationInput,client: QueryClient = db) {
  const [row] = await client
    .insert(notificationTable)
    .values({
      deviceID: data.deviceID,
      pushToken: data.pushToken,
      platform: data.platform,
      appVersion: data.appVersion ?? null,
      userID: data.userID ?? null,
    })
    .onConflictDoUpdate({
      target: notificationTable.deviceID,
      set: {
        pushToken: data.pushToken,
        platform: data.platform,
        appVersion: data.appVersion ?? null,
        isActive: true,
        lastUsedAt: new Date(),
      },
    })
    .returning();

  return row;
}

static async update(deviceID: string, data: UpdateNotificationInput,client: QueryClient = db) {
  const updatePayload: Partial<typeof notificationTable.$inferInsert> = {
    lastUsedAt: new Date(),
  };

  if (data.pushToken !== undefined) updatePayload.pushToken = data.pushToken;
  if (data.platform !== undefined) updatePayload.platform = data.platform;
  if (data.appVersion !== undefined) updatePayload.appVersion = data.appVersion;
  if (data.userID !== undefined) updatePayload.userID = data.userID;
  if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

  const [row] = await client
    .update(notificationTable)
    .set(updatePayload)
    .where(eq(notificationTable.deviceID, deviceID))
    .returning();

  return row ?? null;
}

static async delete(deviceID: string,client: QueryClient = db) {
  const [row] = await client
    .delete(notificationTable)
    .where(eq(notificationTable.deviceID, deviceID))
    .returning();

  return row ?? null;
}

static async findByUserID(userID: string,client: QueryClient = db) {
  const rows = await client
    .select()
    .from(notificationTable)
    .where(eq(notificationTable.userID, userID));

  return rows;
}

static async findByDeviceID(deviceID: string,client: QueryClient = db) {
  const [row] = await client
    .select()
    .from(notificationTable)
    .where(eq(notificationTable.deviceID, deviceID));

  return row ?? null;
}
}
