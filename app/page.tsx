"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Role, UserSession } from "@/types/user";

const PROFILES: Record<Role, UserSession> = {
  admin: { id: 1, nom: "Sophie Martin", email: "sophie@benev.fr", role: "admin" },
  benevole: { id: 2, nom: "Luc Dupont", email: "luc@benev.fr", role: "benevole" },
};

export default function LoginPage() {
  const [selected, setSelected] = useState<Role | null>(null);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = () => {
    if (!selected) return;
    login(PROFILES[selected]);
    router.push("/benevoles");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-sky-50 p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-primary">
            BÉNÉV<span className="text-muted-foreground font-light">APP</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Système de gestion des bénévoles et visiteurs
          </p>
        </div>

        {/* Role selection */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
            Choisissez votre profil
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["benevole", "admin"] as Role[]).map((role) => (
              <Card
                key={role}
                onClick={() => setSelected(role)}
                className={cn(
                  "cursor-pointer transition-all border-2",
                  selected === role
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/40 hover:shadow-sm"
                )}
              >
                <CardContent className="p-5 text-center space-y-2">
                  <div className={cn(
                    "mx-auto w-10 h-10 rounded-full flex items-center justify-center",
                    selected === role ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {role === "admin" ? <ShieldCheck className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-semibold capitalize">{role === "admin" ? "Admin" : "Bénévole"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {role === "admin" ? "Gérer + consulter" : "Consulter"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={!selected}
          onClick={handleLogin}
        >
          Connexion →
        </Button>
      </div>
    </main>
  );
}
