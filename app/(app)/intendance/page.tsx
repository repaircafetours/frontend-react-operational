"use client";

import { useState } from "react";
import { useBenevoles } from "@/hooks/useBenevoles";
import { useAuthStore } from "@/store/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { initialsFromParts } from "@/lib/utils";
import {
    CATEGORIES_BENEVOLE,
    type CategorieBenevole,
    type RegimeAlimentaire,
} from "@/types/benevole";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IntendancePage() {
    const { data: benevoles = [], isLoading, isError } = useBenevoles();
    const { user } = useAuthStore();
    const [afficherInactifs, setAfficherInactifs] = useState(false);

    if (!user) return null;
    if (isLoading) return <PageSkeleton />;
    if (isError)
        return (
            <p className="text-destructive">Erreur lors du chargement.</p>
        );

    // ── Calculs ───────────────────────────────────────────────────────────────

    const benevolesActifs = benevoles.filter((b) => b.actif);
    const benevolesInactifs = benevoles.filter((b) => !b.actif);

    const regimesDifferents = new Set(
        benevolesActifs.map((b) => b.regimeAlimentaire),
    ).size;

    const displayed = afficherInactifs ? benevoles : benevolesActifs;
    const sorted = [...displayed].sort((a, b) =>
        a.regimeAlimentaire.localeCompare(b.regimeAlimentaire, "fr"),
    );

    // Résumé par régime (actifs uniquement)
    const regimeCounts = new Map<RegimeAlimentaire, number>();
    benevolesActifs.forEach((b) => {
        regimeCounts.set(
            b.regimeAlimentaire,
            (regimeCounts.get(b.regimeAlimentaire) ?? 0) + 1,
        );
    });
    const regimeEntries = Array.from(regimeCounts.entries()).sort(
        (a, b) => b[1] - a[1],
    );

    return (
        <div className="space-y-6 max-w-4xl">
            {/* ── Header ── */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Intendance
                </h1>
                <p className="text-muted-foreground mt-1">
                    Régimes alimentaires de l&apos;équipe bénévole
                </p>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-5">
                        <p className="text-3xl font-bold">
                            {benevolesActifs.length}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Bénévoles actifs
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <p className="text-3xl font-bold">
                            {regimesDifferents}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Régimes différents
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-5">
                        <p className="text-3xl font-bold text-muted-foreground">
                            {benevolesInactifs.length}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Bénévoles inactifs
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ── Toggle inactifs ── */}
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none w-fit">
                <input
                    type="checkbox"
                    checked={afficherInactifs}
                    onChange={(e) => setAfficherInactifs(e.target.checked)}
                    className="rounded"
                />
                Afficher les inactifs
            </label>

            {/* ── Table ── */}
            <Card>
                <CardContent className="p-0 overflow-x-auto">
                    {/* Header row */}
                    <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-[560px]">
                        <span>Prénom</span>
                        <span>Nom</span>
                        <span>Catégorie</span>
                        <span>Régime alimentaire</span>
                        <span>Statut</span>
                    </div>

                    {sorted.length === 0 ? (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            Aucun bénévole à afficher
                        </div>
                    ) : (
                        <div className="min-w-[560px]">
                            {sorted.map((b) => (
                                <div
                                    key={b.id}
                                    className="grid grid-cols-5 gap-4 px-4 py-3 border-b last:border-0 items-center hover:bg-muted/20 transition-colors"
                                >
                                    {/* Prénom + avatar */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                                            {initialsFromParts(b.prenom, b.nom)}
                                        </div>
                                        <span className="text-sm truncate">
                                            {b.prenom}
                                        </span>
                                    </div>

                                    {/* Nom */}
                                    <span className="text-sm font-medium truncate">
                                        {b.nom.toUpperCase()}
                                    </span>

                                    {/* Catégorie */}
                                    <Badge
                                        variant={
                                            b.categorie as CategorieBenevole
                                        }
                                        className="w-fit"
                                    >
                                        {CATEGORIES_BENEVOLE[b.categorie]}
                                    </Badge>

                                    {/* Régime */}
                                    <Badge variant="outline" className="w-fit">
                                        {b.regimeAlimentaire}
                                    </Badge>

                                    {/* Statut */}
                                    {b.actif ? (
                                        <Badge
                                            variant="success"
                                            className="w-fit"
                                        >
                                            Actif
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="w-fit"
                                        >
                                            Inactif
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Résumé par régime ── */}
            {regimeEntries.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-3">
                        Résumé par régime{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                            (bénévoles actifs)
                        </span>
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {regimeEntries.map(([regime, count]) => (
                            <div
                                key={regime}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30"
                            >
                                <Badge variant="outline">{regime}</Badge>
                                <span className="text-sm font-semibold">
                                    {count}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    bénévole{count > 1 ? "s" : ""}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
    return (
        <div className="space-y-6 max-w-4xl animate-pulse">
            <div className="space-y-2">
                <div className="h-9 w-44 bg-muted rounded" />
                <div className="h-4 w-64 bg-muted rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded-xl" />
                ))}
            </div>
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="h-72 bg-muted rounded-xl" />
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="flex flex-wrap gap-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 w-36 bg-muted rounded-lg" />
                ))}
            </div>
        </div>
    );
}
