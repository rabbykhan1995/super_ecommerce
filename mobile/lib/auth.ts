import { Platform } from "react-native";

const TOKEN_KEY = "akkaeioaagnajfjlsdfl";

const isWeb = Platform.OS === "web";

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return localStorage.getItem(key);
  }
  const SecureStore = require("expo-secure-store");
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(key, value);
    return;
  }
  const SecureStore = require("expo-secure-store");
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(key);
    return;
  }
  const SecureStore = require("expo-secure-store");
  await SecureStore.deleteItemAsync(key);
}

export const AuthHelper = {
  async getToken(): Promise<string | null> {
    return getItem(TOKEN_KEY);
  },

  async setToken(token: string): Promise<void> {
    await setItem(TOKEN_KEY, token);
  },

  async clearToken(): Promise<void> {
    await deleteItem(TOKEN_KEY);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await getItem(TOKEN_KEY);
    return !!token;
  },
};

export default AuthHelper;
