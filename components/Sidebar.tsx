"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, Ticket, ShieldCheck, LogOut } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/benevoles", label: "Bénévoles", icon: Users },
  { href: "/visiteurs", label: "Visiteurs", icon: Ticket },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) return null;

  return (
    <aside className="w-60 shrink-0 border-r bg-card flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b">
        <span className="text-xl font-black tracking-tight text-primary">
          BÉNÉV<span className="text-muted-foreground font-normal">APP</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        <p className="px-3 text-[10px] font-semibold text-muted-foreground tracking-widest uppercase mb-2">
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}

        {isAdmin() && (
          <>
            <Separator className="my-3" />
            <p className="px-3 text-[10px] font-semibold text-muted-foreground tracking-widest uppercase mb-2">
              Admin
            </p>
            <div className="px-3 py-2 rounded-md bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800">
              <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 text-xs font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                Mode administrateur
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
            {initials(user.nom)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user.nom}</p>
            <Badge variant={user.role === "admin" ? "admin" : "benevole"} className="text-[10px] h-4 px-1.5">
              {user.role === "admin" ? "Admin" : "Bénévole"}
            </Badge>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleLogout}>
          <LogOut className="h-3.5 w-3.5" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}
