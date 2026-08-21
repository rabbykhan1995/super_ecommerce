import { create } from "zustand";
import api, { base_url } from "../lib/axios";
import { permissionStore } from "./permission.store";

export interface IStaffProfile {
  employeeCode: number;
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
  isInitialized: boolean;

  setUser: (user: IUser | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const userStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  setUser: (user) => set({ user }),

  fetchUser: async () => {
    try {
      set({
        isLoading: true,
        isInitialized: false,
      });

      const res = await api.get("/auth/admin-profile");

      if (!res.data.success) {
        set({
          user: null,
          isLoading: false,
          isInitialized: true,
        });
        return;
      }

      set({
        user: res.data.data,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      set({
        user: null,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  logout: async () => {
    // ...
    set({
      user: null,
      isInitialized: true,
    });
  },

  hasPermission: (permission: string) => {
    const user = get().user;

    if (!user) return false;

    if (user.isSuperAdmin) return true;

    return user.permissions.includes(permission);
  },
}));
