"use client";

import {
    Users,
    UserSquare,
    Clock,
    Percent,
    CalendarDays,
    MapPin,
} from "lucide-react";
import { useBenevoles } from "@/hooks/useBenevoles";
import { useVisiteurs } from "@/hooks/useVisiteurs";
import { useEvenements } from "@/hooks/useEvenements";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, initialsFromParts, formatDateTime, isFuture } from "@/lib/utils";
import { STATUTS_OBJET, type StatutObjet } from "@/types/objet";
import { CATEGORIES_BENEVOLE, type CategorieBenevole } from "@/types/benevole";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUT_ORDER: StatutObjet[] = [
    "en_attente",
    "en_cours",
    "repare",
    "irreparable",
    "a_rappeler",
];

const CATEGORIE_ORDER: CategorieBenevole[] = [
    "reparateur",
    "operationnel",
    "intendant",
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const { data: benevoles = [], isLoading: loadingB } = useBenevoles();
    const { data: visiteurs = [], isLoading: loadingV } = useVisiteurs();
    const { data: evenements = [], isLoading: loadingE } = useEvenements();

    const isLoading = loadingB || loadingV || loadingE;
    if (isLoading) return <PageSkeleton />;

    // ── Calculs ───────────────────────────────────────────────────────────────

    const benevolesActifs = benevoles.filter((b) => b.actif);
    const allObjets = visiteurs.flatMap((v) => v.objets);
    const totalObjets = allObjets.length;

    const objetsByStatut: Record<StatutObjet, number> = {
        en_attente: allObjets.filter((o) => o.statut === "en_attente").length,
        en_cours: allObjets.filter((o) => o.statut === "en_cours").length,
        repare: allObjets.filter((o) => o.statut === "repare").length,
        irreparable: allObjets.filter((o) => o.statut === "irreparable").length,
        a_rappeler: allObjets.filter((o) => o.statut === "a_rappeler").length,
    };

    const tauxReparation =
        totalObjets > 0
            ? Math.round((objetsByStatut.repare / totalObjets) * 100)
            : 0;

    const prochainsEvents = evenements
        .filter((e) => isFuture(e.date))
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .slice(0, 3);

    const categoryCounts: Record<CategorieBenevole, number> = {
        reparateur: benevoles.filter((b) => b.categorie === "reparateur")
            .length,
        operationnel: benevoles.filter((b) => b.categorie === "operationnel")
            .length,
        intendant: benevoles.filter((b) => b.categorie === "intendant").length,
    };
    const maxCategorie = Math.max(...Object.values(categoryCounts), 1);

    return (
        <div className="space-y-8 max-w-6xl">
            {/* ── Header ── */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Vue d&apos;ensemble de l&apos;activité du Repair Café
                </p>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={<Users className="h-5 w-5 text-sky-600" />}
                    bg="bg-sky-50"
                    label="Bénévoles actifs"
                    value={benevolesActifs.length}
                />
                <KpiCard
                    icon={<UserSquare className="h-5 w-5 text-violet-600" />}
                    bg="bg-violet-50"
                    label="Visiteurs"
                    value={visiteurs.length}
                />
                <KpiCard
                    icon={<Clock className="h-5 w-5 text-orange-600" />}
                    bg="bg-orange-50"
                    label="Objets en attente"
                    value={objetsByStatut.en_attente}
                />
                <KpiCard
                    icon={<Percent className="h-5 w-5 text-emerald-600" />}
                    bg="bg-emerald-50"
                    label="Taux de réparation"
                    value={tauxReparation}
                    unit="%"
                />
            </div>

            {/* ── Statuts & Répartition ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Statut des objets */}
                <Card>
                    <CardContent className="p-5">
                        <p className="text-sm font-semibold mb-4">
                            Statut des objets
                        </p>
                        {totalObjets === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-6">
                                Aucun objet enregistré
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {STATUT_ORDER.map((statut) => {
                                    const { label, color } =
                                        STATUTS_OBJET[statut];
                                    const count = objetsByStatut[statut];
                                    const pct = Math.round(
                                        (count / totalObjets) * 100,
                                    );
                                    return (
                                        <div key={statut}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span
                                                    className={cn(
                                                        "text-xs font-medium px-2 py-0.5 rounded-full",
                                                        color,
                                                    )}
                                                >
                                                    {label}
                                                </span>
                                                <span className="text-xs font-semibold text-muted-foreground">
                                                    {count}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-primary/60 transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Répartition bénévoles */}
                <Card>
                    <CardContent className="p-5">
                        <p className="text-sm font-semibold mb-4">
                            Répartition bénévoles
                        </p>
                        <div className="space-y-3">
                            {CATEGORIE_ORDER.map((cat) => {
                                const count = categoryCounts[cat];
                                const pct = Math.round(
                                    (count / maxCategorie) * 100,
                                );
                                return (
                                    <div key={cat}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm">
                                                {CATEGORIES_BENEVOLE[cat]}
                                            </span>
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                {count}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-primary/60 transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Prochains événements ── */}
            <div>
                <h2 className="text-lg font-semibold mb-3">
                    Prochains événements
                </h2>
                {prochainsEvents.length === 0 ? (
                    <Card>
                        <CardContent className="p-5 text-center text-sm text-muted-foreground">
                            Aucun événement à venir
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {prochainsEvents.map((e) => (
                            <Card key={e.id}>
                                <CardContent className="p-4 space-y-2">
                                    <p className="font-semibold text-sm">
                                        {e.nom}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                                        {formatDateTime(e.date)}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                                        {e.lieu} · {e.ville}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Équipe active ── */}
            {benevolesActifs.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-3">
                        Équipe active
                    </h2>
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex flex-wrap gap-2">
                                {benevolesActifs.map((b) => (
                                    <div
                                        key={b.id}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/40 text-sm"
                                    >
                                        <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                                            {initialsFromParts(b.prenom, b.nom)}
                                        </div>
                                        <span className="font-medium">
                                            {b.prenom} {b.nom}
                                        </span>
                                        <Badge
                                            variant={b.categorie}
                                            className="text-[10px] h-4 px-1.5"
                                        >
                                            {CATEGORIES_BENEVOLE[b.categorie]}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
    icon,
    bg,
    label,
    value,
    unit = "",
}: {
    icon: React.ReactNode;
    bg: string;
    label: string;
    value: number;
    unit?: string;
}) {
    return (
        <Card>
            <CardContent className="p-5">
                <div className={cn("inline-flex p-2 rounded-lg mb-3", bg)}>
                    {icon}
                </div>
                <p className="text-3xl font-bold">
                    {value}
                    {unit}
                </p>
                <p className="text-sm font-medium mt-0.5 text-muted-foreground">
                    {label}
                </p>
            </CardContent>
        </Card>
    );
}

function PageSkeleton() {
    return (
        <div className="space-y-8 max-w-6xl animate-pulse">
            <div className="h-9 w-48 bg-muted rounded" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-28 bg-muted rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <div key={i} className="h-52 bg-muted rounded-xl" />
                ))}
            </div>
            <div className="h-8 w-44 bg-muted rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted rounded-xl" />
                ))}
            </div>
            <div className="h-8 w-36 bg-muted rounded" />
            <div className="h-20 bg-muted rounded-xl" />
        </div>
    );
}
