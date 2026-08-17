// lib/notifications.ts
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import api from "./api";
import { getDeviceID } from "./utils";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device or emulator with Play Services");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permission not granted");
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = tokenData.data;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // deviceID paoa - Android ID, device thaka porjonto persistent
  // ⚠️ await lagbe, na hoile Promise object pathaia debe backend e
  const deviceID = await getDeviceID();

  try {
    await api.post("/notification/create-push-notification", {
      deviceID,
      pushToken: token,
      platform: Platform.OS,
      appVersion: Constants.expoConfig?.version ?? null,
    });
  } catch (err) {
    console.log("Failed to save push token", err);
  }

  return token;
}

/**
 * Login/app-init success howar por call hobe - notification permission/token
 * re-fetch korার dorkar nai, shudhu existing device row take current user
 * er sathe link kore dey.
 */
export async function linkDeviceToUser(userID: string) {
  try {
    const deviceID = await getDeviceID();
    await api.post(`/notification/link-device/${deviceID}`, { userID, isActive:true });
  } catch (err) {
    // Best-effort - fail hoile o user flow block hobe na
    console.log("Failed to link device to user", err);
  }
}