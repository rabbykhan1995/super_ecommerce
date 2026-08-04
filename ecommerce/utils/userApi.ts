import api from "./apiconfig";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  msg?: string;
  message?: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  image?: string | null;
  address?: string;
  openID?: string | null;
};

export async function updateProfile(payload: {
  name: string;
  mobile?: string;
  address?: string;
}) {
  const res = await api.put<ApiResponse<UserProfile>>("/auth/update-profile", payload);
  return res.data.data;
}

export async function checkoutMobile(payload: {
  name: string;
  mobile?: string;
  address?: string;
}) {
  const res = await api.post<ApiResponse<UserProfile>>("/auth/checkout-mobile", payload);
  return res.data.data;
}

export async function sendPasswordResetOTP(email: string) {
  const res = await api.post<ApiResponse<null>>("/auth/send-forget-password-otp", { email });
  return res.data;
}

export async function resetPassword(payload: {
  email: string;
  otp: string;
  password: string;
}) {
  const res = await api.post<ApiResponse<{ token: string; user: UserProfile }>>("/auth/reset-password", payload);
  return res.data;
}
