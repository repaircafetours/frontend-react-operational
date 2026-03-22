"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users, ChefHat } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Role, UserSession } from "@/types/user";

// ── Mock profiles ─────────────────────────────────────────────────────────────

const PROFILES: Record<Role, UserSession> = {
    admin: {
        id: 1,
        nom: "Martin",
        prenom: "Sophie",
        email: "sophie@repaircafe.fr",
        role: "admin",
    },
    benevole: {
        id: 2,
        nom: "Dupont",
        prenom: "Luc",
        email: "luc@repaircafe.fr",
        role: "benevole",
    },
    benevole_intendant: {
        id: 5,
        nom: "Leroy",
        prenom: "Camille",
        email: "camille@repaircafe.fr",
        role: "benevole_intendant",
    },
};

// ── Profile display config ────────────────────────────────────────────────────

interface ProfileConfig {
    label: string;
    description: string;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
}

const PROFILE_CONFIG: Record<Role, ProfileConfig> = {
    admin: {
        label: "Administrateur",
        description: "Accès complet lecture/écriture",
        icon: ShieldCheck,
        iconBg: "bg-violet-100",
        iconColor: "text-violet-700",
    },
    benevole: {
        label: "Bénévole",
        description: "Accès en lecture",
        icon: Users,
        iconBg: "bg-sky-100",
        iconColor: "text-sky-700",
    },
    benevole_intendant: {
        label: "Intendant",
        description: "Régime alimentaire uniquement",
        icon: ChefHat,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-700",
    },
};

const ROLE_ORDER: Role[] = ["admin", "benevole", "benevole_intendant"];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
    const { login } = useAuthStore();
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const handleLogin = () => {
        if (!selectedRole) return;
        login(PROFILES[selectedRole]);
        if (selectedRole === "benevole_intendant") {
            router.push("/intendance");
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-sky-50 p-4">
            <div className="w-full max-w-2xl space-y-10">
                {/* Logo */}
                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-black tracking-tight">
                        <span className="text-primary">Repair</span>
                        <span className="text-muted-foreground font-light">
                            Café
                        </span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Système de gestion du Repair Café — sélectionnez votre
                        profil pour continuer
                    </p>
                </div>

                {/* Separator */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-border" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Choisissez votre profil
                    </p>
                    <div className="flex-1 h-px bg-border" />
                </div>

                {/* Profile cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {ROLE_ORDER.map((role) => {
                        const config = PROFILE_CONFIG[role];
                        const Icon = config.icon;
                        const isSelected = selectedRole === role;

                        return (
                            <Card
                                key={role}
                                onClick={() => setSelectedRole(role)}
                                className={cn(
                                    "cursor-pointer border-2 transition-all duration-150",
                                    isSelected
                                        ? "border-primary bg-primary/5 shadow-md"
                                        : "border-border hover:shadow-lg hover:-translate-y-0.5",
                                )}
                            >
                                <CardContent className="p-7 flex flex-col items-center text-center gap-4">
                                    <div
                                        className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center",
                                            config.iconBg,
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                "h-7 w-7",
                                                config.iconColor,
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-bold text-base">
                                            {config.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {config.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Connexion button */}
                <div className="flex justify-center">
                    <Button
                        size="lg"
                        className="px-12"
                        disabled={!selectedRole}
                        onClick={handleLogin}
                    >
                        Connexion
                    </Button>
                </div>
            </div>
        </main>
    );
}
