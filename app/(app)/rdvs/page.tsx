"use client";

import { useState } from "react";
import { Trash2, CalendarCheck } from "lucide-react";
import { useRdvs, useDeleteRdv } from "@/hooks/useRdvs";
import { useVisiteurs } from "@/hooks/useVisiteurs";
import { useEvenements } from "@/hooks/useEvenements";
import { useAuthStore } from "@/store/auth";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateShort } from "@/lib/utils";
import type { Rdv } from "@/types/rdv";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded" />
                </div>
            </div>
            <Card className="overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            {[
                                "Visiteur",
                                "Objet",
                                "Événement",
                                "Date RDV",
                                "",
                            ].map((h) => (
                                <th
                                    key={h}
                                    className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-border/50">
                                {Array.from({ length: 4 }).map((__, j) => (
                                    <td key={j} className="py-3 px-4">
                                        <div className="h-4 bg-muted rounded w-3/4" />
                                    </td>
                                ))}
                                <td className="py-3 px-4">
                                    <div className="h-7 w-7 bg-muted rounded" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RdvsPage() {
    const { data: rdvs = [], isLoading: loadingRdvs } = useRdvs();
    const { data: visiteurs = [], isLoading: loadingVisiteurs } =
        useVisiteurs();
    const { data: evenements = [], isLoading: loadingEvenements } =
        useEvenements();
    const { mutate: deleteRdv, isPending: isDeleting } = useDeleteRdv();
    const { isAdmin } = useAuthStore();

    const [toDelete, setToDelete] = useState<Rdv | null>(null);

    const isLoading = loadingRdvs || loadingVisiteurs || loadingEvenements;
    if (isLoading) return <PageSkeleton />;

    const admin = isAdmin();

    // ── Lookup maps ────────────────────────────────────────────────────────────

    const visiteurMap = new Map(visiteurs.map((v) => [v.id, v]));
    const evenementMap = new Map(evenements.map((e) => [e.id, e]));

    // ── Helpers ────────────────────────────────────────────────────────────────

    const getVisiteurLabel = (rdv: Rdv): string => {
        if (!rdv.visiteurId) return "Visiteur inconnu";
        const v = visiteurMap.get(rdv.visiteurId);
        if (!v) return `Visiteur #${rdv.visiteurId}`;
        return `${v.prenom} ${v.nom.toUpperCase()}`;
    };

    const getObjetLabel = (rdv: Rdv): string => {
        if (!rdv.visiteurId) return `Objet #${rdv.objetId}`;
        const v = visiteurMap.get(rdv.visiteurId);
        if (!v) return `Objet #${rdv.objetId}`;
        const obj = v.objets.find((o) => o.id === rdv.objetId);
        return obj ? obj.nom : `Objet #${rdv.objetId}`;
    };

    const getEvenementLabel = (rdv: Rdv): string => {
        const ev = evenementMap.get(rdv.evenementId);
        return ev ? ev.nom : `Événement #${rdv.evenementId}`;
    };

    const handleConfirmDelete = () => {
        if (!toDelete) return;
        deleteRdv(
            { id: toDelete.id, evenementId: toDelete.evenementId },
            { onSuccess: () => setToDelete(null) },
        );
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <CalendarCheck className="h-7 w-7 text-primary" />
                        Rendez-vous
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground mr-1">
                            {rdvs.length}
                        </span>
                        rendez-vous au total
                    </p>
                </div>
            </div>

            {/* ── Table ── */}
            <Card className="overflow-hidden">
                {rdvs.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                        Aucun rendez-vous enregistré.
                    </p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4 border-b">
                                    Visiteur
                                </th>
                                <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4 border-b">
                                    Objet
                                </th>
                                <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4 border-b">
                                    Événement
                                </th>
                                <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4 border-b">
                                    Date RDV
                                </th>
                                {admin && (
                                    <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4 border-b w-12" />
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {rdvs.map((rdv) => (
                                <tr
                                    key={rdv.id}
                                    className="hover:bg-muted/40 transition-colors border-b border-border/50 last:border-0"
                                >
                                    <td className="py-3 px-4 font-medium">
                                        {getVisiteurLabel(rdv)}
                                    </td>
                                    <td className="py-3 px-4 text-muted-foreground">
                                        {getObjetLabel(rdv)}
                                    </td>
                                    <td className="py-3 px-4 text-muted-foreground">
                                        {getEvenementLabel(rdv)}
                                    </td>
                                    <td className="py-3 px-4 text-muted-foreground tabular-nums">
                                        {rdv.date
                                            ? formatDateShort(rdv.date)
                                            : rdv.createdAt
                                              ? formatDateShort(rdv.createdAt)
                                              : "—"}
                                    </td>
                                    {admin && (
                                        <td className="py-3 px-4">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                onClick={() => setToDelete(rdv)}
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>

            {/* ── Modal suppression ── */}
            <DeleteConfirm
                open={!!toDelete}
                onOpenChange={(open) => !open && setToDelete(null)}
                name={toDelete ? `le RDV de ${getVisiteurLabel(toDelete)}` : ""}
                isPending={isDeleting}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
