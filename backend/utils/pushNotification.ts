// ekhane axios diye jodi kora jay...ar exp.host kivabe set hobe sob...

// export async function sendPushNotification(pushToken: string, title: string, body: string, data?: any) {
//   if (!pushToken || !pushToken.startsWith("ExponentPushToken")) return;

//   await fetch("https://exp.host/--/api/v2/push/send", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//     body: JSON.stringify({
//       to: pushToken,
//       title,
//       body,
//       data: data || {},
//       sound: "default",
//     }),
//   });
// }

import axios from "axios";

// exp.host base URL - env variable diye override korar option rakhlam,
// production e hardcode na kore .env theke read kora better practice
const EXPO_PUSH_URL =
  process.env.EXPO_PUSH_URL ?? "https://exp.host/--/api/v2/push/send";

const expoClient = axios.create({
  baseURL: EXPO_PUSH_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10_000, // 10s - exp.host slow hole hang kore thakle na
});

type PushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
};

type ExpoTicket = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string }; // "DeviceNotRegistered" etc.
};

/**
 * SINGLE TOKEN
 * Tomar original function - axios diye, base URL config kore.
 */
export async function sendPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  if (!pushToken || !pushToken.startsWith("ExponentPushToken")) return;

  try {
    const res = await expoClient.post<{ data: ExpoTicket }>("", {
      to: pushToken,
      title,
      body,
      data: data ?? {},
      sound: "default",
    } satisfies PushMessage);

    const ticket = res.data?.data;

    // Token dead/uninstalled hole caller ke janiye dao, jate DB te isActive = false set kora jay
    if (ticket?.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
      return { success: false, shouldDeactivate: true, pushToken };
    }

    return { success: ticket?.status === "ok", shouldDeactivate: false, pushToken };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Expo push send failed:", err.response?.data ?? err.message);
    } else {
      console.error("Expo push send failed:", err);
    }
    return { success: false, shouldDeactivate: false, pushToken };
  }
}

/**
 * BATCH (multiple tokens)
 * Expo ekbare max 100 ta token accept kore ekta request e.
 * Real app e ekjon user er multiple device thakbe + broadcast type notification lagle
 * eta use korba - single token diye loop e call korle rate limit e problem hobe.
 */
export async function sendBulkPushNotifications(
  pushTokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  const validTokens = pushTokens.filter((t) => t?.startsWith("ExponentPushToken"));
  if (validTokens.length === 0) return [];

  const CHUNK_SIZE = 100;
  const chunks: string[][] = [];
  for (let i = 0; i < validTokens.length; i += CHUNK_SIZE) {
    chunks.push(validTokens.slice(i, i + CHUNK_SIZE));
  }

  const results: { pushToken: string; success: boolean; shouldDeactivate: boolean }[] = [];

  for (const chunk of chunks) {
    const messages: PushMessage[] = chunk.map((to) => ({
      to,
      title,
      body,
      data: data ?? {},
      sound: "default",
    }));

    try {
      const res = await expoClient.post<{ data: ExpoTicket[] }>("", messages);
      const tickets = res.data?.data ?? [];

      tickets.forEach((ticket, idx) => {
        const pushToken = chunk[idx];
        const shouldDeactivate =
          ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered";

        results.push({
          pushToken,
          success: ticket.status === "ok",
          shouldDeactivate,
        });
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Expo bulk push failed:", err.response?.data ?? err.message);
      } else {
        console.error("Expo bulk push failed:", err);
      }
      chunk.forEach((pushToken) =>
        results.push({ pushToken, success: false, shouldDeactivate: false }),
      );
    }
  }

  return results;
}