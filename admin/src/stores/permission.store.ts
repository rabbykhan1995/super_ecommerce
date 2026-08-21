import { create } from "zustand";
import api from "../lib/axios";

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

interface PermissionState {
  permissions: Permission[];
  isLoading: boolean;
  fetchPermissions: () => Promise<void>;
  setPermissions: (permissions: Permission[]) => void;
  clearPermissions: () => void;
}

export const permissionStore = create<PermissionState>((set) => ({
  permissions: [],
  isLoading: false,

  setPermissions: (permissions) => {
    set({ permissions });
  },

  fetchPermissions: async () => {
    try {
      set({ isLoading: true });

      const res = await api.get("/admin/permissions");

      if (res.data.success) {
        set({
          permissions: res.data.data,
          isLoading: false,
        });
      } else {
        set({
          permissions: [],
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error);

      set({
        permissions: [],
        isLoading: false,
      });
    }
  },

  clearPermissions: () => {
    set({
      permissions: [],
    });
  },
}));