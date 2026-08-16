import { QueryClient } from "../../drizzle/src";
import { CreateNotificationInput, SendNotificationParams, UpdateNotificationInput } from "./notification.type";
import NotificationRepo from "./notification.repository";
import { ApiError } from "../../utils/ApiError";
import { sendBulkPushNotifications } from "../../utils/pushNotification";
import ContactService from "../contact/contact.service";

export default class NotificationService {
    static async create(data: CreateNotificationInput, tx?: QueryClient) {
        const notification = await NotificationRepo.create(data, tx);

        if (!notification) {
            throw new ApiError(400, "notification creation failed");
        }

        return notification;
    }

    static async update(deviceID: string, data: UpdateNotificationInput, tx?: QueryClient) {
        const update = await NotificationRepo.update(deviceID, data, tx);

        if (!update) {
            throw new ApiError(400, "Notification updation failed");
        }

        return update;
    }

    static async delete(deviceID: string, tx?: QueryClient) {
        return await NotificationRepo.delete(deviceID, tx)
    }

    static async findByUserID(userID: string, tx?: QueryClient) {
        return await NotificationRepo.findByUserID(userID, tx);
    }

    static async findByDeviceID(deviceID: string, tx?: QueryClient) {
        return await NotificationRepo.findByDeviceID(deviceID, tx);
    }

    static sendNotification(params: SendNotificationParams) {
        // Fire-and-forget wrapper - caller ke await korte hobe na, response block hobe na
        (async () => {
            try {
                const { userID, contactID, deviceID, title, body, data } = params;

                // ── CASE 1: Direct deviceID ──
                // Guest/non-user device - login e nai emon device ke o notification pathano jay,
                // karon token table e userID null thakleo pushToken thake.
                if (deviceID) {
                    const device = await NotificationService.findByDeviceID(deviceID);

                    if (!device || !device.isActive) return;

                    const results = await sendBulkPushNotifications(
                        [device.pushToken],
                        title,
                        body,
                        data,
                    );
                    // push failed hole device er existing ar nai. tai eta ekhon deactivate koro...
                    if (results[0]?.shouldDeactivate) {
                        await NotificationRepo.update(device.deviceID, {
                            isActive: false,
                        });
                    }
                    return;
                }

                // ── CASE 2 & 3: userID resolve kora (direct ba contact theke) ──
                let resolvedUserID = userID;

                if (!resolvedUserID) {
                    if (!contactID) return; // userID, deviceID, contactID - kono ekটাও na thakle kichu korar nai

                    const contact = await ContactService.findByID(contactID);
                    if (!contact?.userID) return;

                    resolvedUserID = contact.userID;
                }

                const devices = await NotificationService.findByUserID(resolvedUserID);

                const activeTokens = devices
                    .filter((d) => d.isActive)
                    .map((d) => d.pushToken);

                if (activeTokens.length === 0) return;

                const results = await sendBulkPushNotifications(
                    activeTokens,
                    title,
                    body,
                    data,
                );

                const deadTokens = results
                    .filter((r) => r.shouldDeactivate)
                    .map((r) => r.pushToken);

                if (deadTokens.length > 0) {
                    const deadDevices = devices.filter((d) =>
                        deadTokens.includes(d.pushToken),
                    );
                    await Promise.all(
                        deadDevices.map((d) =>
                            NotificationRepo.update(d.deviceID, { isActive: false }),
                        ),
                    );
                }
            } catch (err) {
                console.error("Failed to send push notification:", err);
            }
        })();
    }
}