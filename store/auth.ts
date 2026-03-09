import { UserSession } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: UserSession | null;
  login: (user: UserSession) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      login: (user: UserSession) => set({ user }),

      logout: () => set({ user: null }),

      isAdmin: () => get().user?.role === "admin",
    }),
    {
      name: "benevapp-auth",
    }
  )
);
