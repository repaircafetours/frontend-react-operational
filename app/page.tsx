"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import type { UserSession } from "@/types/user";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
    const router = useRouter();

    const [loginValue, setLoginValue] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await apiFetch(
                "http://localhost:8000/api/v1/auth/login",
                {
                    method: "POST",
                    body: JSON.stringify({ login: loginValue, password }),
                },
            );

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setError(
                    (body as { detail?: string }).detail ??
                        "Identifiants incorrects. Veuillez réessayer.",
                );
                return;
            }

            const data = (await res.json()) as {
                token: string;
                user?: Partial<UserSession>;
            };

            const userSession: UserSession = {
                id: data.user?.id ?? 1,
                nom: data.user?.nom ?? loginValue,
                prenom: data.user?.prenom ?? "",
                email: data.user?.email ?? "",
                role: data.user?.role ?? "admin",
            };

            useAuthStore.getState().login(userSession, data.token);

            if (userSession.role === "benevole_intendant") {
                router.push("/intendance");
            } else {
                router.push("/dashboard");
            }
        } catch {
            setError(
                "Impossible de contacter le serveur. Vérifiez votre connexion.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-sky-50 p-4">
            <div className="w-full max-w-sm space-y-8">
                {/* Logo */}
                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-black tracking-tight">
                        <span className="text-primary">Repair</span>
                        <span className="text-muted-foreground font-light">
                            Café
                        </span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Système de gestion du Repair Café — connectez-vous pour
                        continuer
                    </p>
                </div>

                {/* Login card */}
                <Card className="border shadow-md">
                    <CardHeader className="pb-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center">
                            Connexion
                        </p>
                    </CardHeader>

                    <CardContent className="pt-2">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Login field */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="login"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Identifiant
                                </label>
                                <input
                                    id="login"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={loginValue}
                                    onChange={(e) =>
                                        setLoginValue(e.target.value)
                                    }
                                    placeholder="Votre identifiant"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition"
                                />
                            </div>

                            {/* Password field */}
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Mot de passe
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition"
                                />
                            </div>

                            {/* Error message */}
                            {error && (
                                <p
                                    role="alert"
                                    className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive"
                                >
                                    {error}
                                </p>
                            )}

                            {/* Submit button */}
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Connexion en cours…
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Se connecter
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
