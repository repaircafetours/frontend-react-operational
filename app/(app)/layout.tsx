"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!user) {
            router.replace("/");
            return;
        }
        if (
            user.role === "benevole_intendant" &&
            !pathname.startsWith("/intendance")
        ) {
            router.replace("/intendance");
        }
    }, [user, pathname, router]);

    if (!user) return null;
    if (
        user.role === "benevole_intendant" &&
        !pathname.startsWith("/intendance")
    )
        return null;

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
    );
}
