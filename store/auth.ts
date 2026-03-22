import type { UserSession } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
    user: UserSession | null;
    login: (user: UserSession) => void;
    logout: () => void;
    isAdmin: () => boolean;
    isIntendant: () => boolean;
    canWrite: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,

            login: (user: UserSession) => set({ user }),

            logout: () => set({ user: null }),

            /** Full read/write access */
            isAdmin: () => get().user?.role === "admin",

            /** Intendant: read-only, restricted to dietary info */
            isIntendant: () => get().user?.role === "benevole_intendant",

            /** Only admins can mutate data */
            canWrite: () => get().user?.role === "admin",
        }),
        {
            name: "repaircafe-auth",
        },
    ),
);
