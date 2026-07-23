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

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  const res = await api.post<ApiResponse<null>>("/auth/change-password", payload);
  return res.data;
}
