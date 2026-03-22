"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    UserRound,
    CalendarDays,
    ChefHat,
    LogOut,
} from "lucide-react";
import { cn, initialsFromParts } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ── Nav items ─────────────────────────────────────────────────────────────────

const mainNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/benevoles", label: "Bénévoles", icon: Users },
    { href: "/visiteurs", label: "Visiteurs", icon: UserRound },
    { href: "/evenements", label: "Événements", icon: CalendarDays },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAdmin, isIntendant } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    if (!user) return null;

    const intendantOnly = isIntendant();

    const roleBadgeVariant =
        user.role === "admin"
            ? ("admin" as const)
            : user.role === "benevole_intendant"
              ? ("intendant" as const)
              : ("benevole" as const);

    const roleBadgeLabel =
        user.role === "admin"
            ? "Admin"
            : user.role === "benevole_intendant"
              ? "Intendant"
              : "Bénévole";

    return (
        <aside className="w-64 shrink-0 border-r bg-card flex flex-col h-screen sticky top-0">
            {/* ── Logo ── */}
            <div className="px-6 py-5 border-b">
                <span className="text-xl font-black text-primary tracking-tight">
                    Repair
                </span>
                <span className="text-xl font-normal text-muted-foreground">
                    Café
                </span>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {intendantOnly ? (
                    /* Intendant : uniquement l'accès Intendance */
                    <Link
                        href="/intendance"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            pathname.startsWith("/intendance")
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted",
                        )}
                    >
                        <ChefHat className="h-4 w-4" />
                        Intendance
                    </Link>
                ) : (
                    /* Admin & Bénévole : navigation complète */
                    <>
                        {mainNavItems.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    pathname.startsWith(href)
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted",
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        ))}
                    </>
                )}

                {/* ── Section Admin ── */}
                {isAdmin() && (
                    <>
                        <Separator className="my-3" />
                        <div className="px-3 py-1">
                            <Badge variant="admin">Mode administrateur</Badge>
                        </div>
                    </>
                )}
            </nav>

            {/* ── Footer utilisateur ── */}
            <div className="p-4 border-t space-y-3">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {initialsFromParts(user.prenom, user.nom)}
                    </div>

                    {/* Identité + badge rôle */}
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                            {user.prenom}{" "}
                            <span className="uppercase">{user.nom}</span>
                        </p>
                        <Badge
                            variant={roleBadgeVariant}
                            className="text-[10px] h-4 px-1.5 mt-0.5"
                        >
                            {roleBadgeLabel}
                        </Badge>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={handleLogout}
                >
                    <LogOut className="h-3.5 w-3.5" />
                    Déconnexion
                </Button>
            </div>
        </aside>
    );
}
