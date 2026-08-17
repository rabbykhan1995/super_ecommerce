export type DevicePlatformType = "android" | "ios" | "windows" | "linux";

export type Notification = {
 id: string;
 createdAt: Date;
 updatedAt: Date;
 userID: string | null;
 isActive: boolean;
 deviceID: string;
 pushToken: string;
 platform: "android" | "ios" | "windows" | "linux";
 appVersion: string | null;
 lastUsedAt: Date;
}


export type CreateNotificationInput = {
 deviceID: string;
 pushToken: string;
 platform: "android" | "ios" | "windows" | "linux";
 appVersion?: string | null | undefined;
 userID?: string | null | undefined;
}

export type UpdateNotificationInput = {
 deviceID?: string | undefined;
 pushToken?: string | undefined;
 platform?: "android" | "ios" | "windows" | "linux" | undefined;
 appVersion?: string | null | undefined;
 userID?: string | null | undefined;
 isActive?: boolean | undefined;
}