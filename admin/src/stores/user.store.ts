import { create } from "zustand";
import api, {base_url} from "../lib/axios";

export interface IStaffProfile {
  employeeCode: string;
  designation: string | null;
  department: string | null;
}

export interface IUserRole {
  id: string;
  name: string;
  isSuperAdmin: boolean;
}

export interface IUser {
  id: string;
  name: string;
  email: string | null;
  mobile: string | null;
  image: string | null;
  roles: IUserRole[];
  permissions: string[];
  isSuperAdmin: boolean;
  staffProfile: IStaffProfile | null;
}

interface UserState {
  user: IUser | null;
  isLoading: boolean;
  setUser: (user: IUser | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const userStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),

  fetchUser: async () => {
    try {
      set({ isLoading: true });

      const res = await api(`/auth/get-profile`);

      if (!res.data.success === true) {
        set({ user: null, isLoading: false });
        return;
      }

      const data = await res.data;

      set({
        user: data.data,
        isLoading: false,
      });
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    await fetch(`${base_url}/auth/logout`, {
      method: "GET",
      credentials: "include",
    });

    set({ user: null });
    window.location.replace("/login");
  },

  hasPermission: (permission: string) => {
    const user = get().user;
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return user.permissions.includes(permission);
  },
}));
