"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useBenevole, useDeleteBenevole } from "@/hooks/useBenevoles";
import { useVisiteurs } from "@/hooks/useVisiteurs";
import { useAuthStore } from "@/store/auth";
import { BenevoleModal } from "@/components/modals/BenevoleModal";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, initialsFromParts, formatDate } from "@/lib/utils";
import { CATEGORIES_BENEVOLE, type CategorieBenevole } from "@/types/benevole";
import { STATUTS_OBJET } from "@/types/objet";

// ── Role labels ───────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
    admin: "Administrateur",
    benevole: "Bénévole",
    benevole_intendant: "Intendant",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BenevoleDetailPage() {
    const { benevoleId } = useParams<{ benevoleId: string }>();
    const router = useRouter();
    const { isAdmin } = useAuthStore();

    const { data: b, isLoading, isError } = useBenevole(Number(benevoleId));
    const { data: visiteurs = [] } = useVisiteurs();
    const { mutate: deleteBenevole, isPending: isDeleting } =
        useDeleteBenevole();

    const [modalOpen, setModalOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    if (isLoading) return <PageSkeleton />;
    if (isError || !b)
        return (
            <p className="text-destructive p-4">Bénévole introuvable.</p>
        );

    const objetsAssignes = visiteurs
        .flatMap((v) => v.objets)
        .filter((o) => o.benevoleId === b.id);

    return (
        <div className="space-y-6 max-w-4xl">
            {/* ── Breadcrumb ── */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/benevoles")}
                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Bénévoles
                </Button>
            </div>

            {/* ── Header card ── */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        {/* Avatar + name */}
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold shrink-0">
                                {initialsFromParts(b.prenom, b.nom)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {b.prenom}{" "}
                                    <span className="uppercase">{b.nom}</span>
                                </h1>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <Badge
                                        variant={
                                            b.categorie as CategorieBenevole
                                        }
                                    >
                                        {CATEGORIES_BENEVOLE[b.categorie]}
                                    </Badge>
                                    {b.actif ? (
                                        <Badge variant="success">Actif</Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            Inactif
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Admin actions */}
                        {isAdmin() && (
                            <div className="flex gap-2 shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setModalOpen(true)}
                                    className="gap-1.5"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Modifier
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteOpen(true)}
                                    className="gap-1.5 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Supprimer
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ── Detail grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations */}
                <Card>
                    <CardContent className="p-5 space-y-4">
                        <p className="font-semibold text-sm">Informations</p>
                        <div className="space-y-3 text-sm divide-y">
                            <InfoRow
                                label="Rôle app"
                                value={ROLE_LABELS[b.role] ?? b.role}
                            />
                            <InfoRow
                                label="Catégorie"
                                value={CATEGORIES_BENEVOLE[b.categorie]}
                            />
                            <InfoRow
                                label="Régime alimentaire"
                                value={b.regimeAlimentaire}
                            />
                            {b.categorie === "reparateur" &&
                                b.secteurs.length > 0 && (
                                    <div className="pt-3">
                                        <span className="text-muted-foreground">
                                            Secteurs
                                        </span>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {b.secteurs.map((s) => (
                                                <span
                                                    key={s}
                                                    className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
                                                >
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            <InfoRow
                                label="Inscrit le"
                                value={formatDate(b.createdAt)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Objets assignés */}
                <Card>
                    <CardContent className="p-5 space-y-3">
                        <p className="font-semibold text-sm">
                            Objets assignés{" "}
                            <span className="text-muted-foreground font-normal">
                                ({objetsAssignes.length})
                            </span>
                        </p>

                        {objetsAssignes.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">
                                Aucun objet assigné
                            </p>
                        ) : (
                            <div className="space-y-0 divide-y">
                                {objetsAssignes.map((o) => {
                                    const statut = STATUTS_OBJET[o.statut];
                                    const visiteur = visiteurs.find(
                                        (v) => v.id === o.visiteurId,
                                    );
                                    return (
                                        <div
                                            key={o.id}
                                            className="flex items-center justify-between py-3 gap-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {o.nom}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {o.marque}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span
                                                    className={cn(
                                                        "text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap",
                                                        statut.color,
                                                    )}
                                                >
                                                    {statut.label}
                                                </span>
                                                {visiteur && (
                                                    <button
                                                        onClick={() =>
                                                            router.push(
                                                                `/visiteurs/${visiteur.id}`,
                                                            )
                                                        }
                                                        className="text-xs text-primary hover:underline whitespace-nowrap"
                                                    >
                                                        {visiteur.prenom}{" "}
                                                        {visiteur.nom}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── Modals ── */}
            <BenevoleModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                benevole={b}
            />
            <DeleteConfirm
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                name={`${b.prenom} ${b.nom}`}
                isPending={isDeleting}
                onConfirm={() =>
                    deleteBenevole(b.id, {
                        onSuccess: () => router.push("/benevoles"),
                    })
                }
            />
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4 pt-3 first:pt-0">
            <span className="text-muted-foreground shrink-0">{label}</span>
            <span className="font-medium text-right">{value}</span>
        </div>
    );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
    return (
        <div className="space-y-6 max-w-4xl animate-pulse">
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-36 bg-muted rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-56 bg-muted rounded-xl" />
                <div className="h-56 bg-muted rounded-xl" />
            </div>
        </div>
    );
}
