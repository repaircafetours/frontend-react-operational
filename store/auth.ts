import type { UserSession } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
    user: UserSession | null;
    token: string | null;
    login: (user: UserSession, token: string) => void;
    logout: () => void;
    isAdmin: () => boolean;
    isIntendant: () => boolean;
    canWrite: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,

            login: (user: UserSession, token: string) => set({ user, token }),

            logout: () => set({ user: null, token: null }),

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
