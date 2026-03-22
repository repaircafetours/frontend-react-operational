"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    Mail,
    Phone,
    Info,
    Calendar,
    Package,
    Pencil,
    Trash2,
} from "lucide-react";
import { useVisiteurs, useDeleteVisiteur } from "@/hooks/useVisiteurs";
import { useAuthStore } from "@/store/auth";
import { VisiteurModal } from "@/components/modals/VisiteurModal";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    initialsFromParts,
    formatPhone,
    formatDateShort,
    cn,
} from "@/lib/utils";
import type { Visiteur } from "@/types/visiteur";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-36 bg-muted rounded" />
                    <div className="h-4 w-24 bg-muted rounded" />
                </div>
                <div className="h-9 w-28 bg-muted rounded" />
            </div>
            <div className="h-9 w-full bg-muted rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-52 bg-muted rounded-lg" />
                ))}
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function VisiteursPage() {
    const { data: visiteurs = [], isLoading, isError } = useVisiteurs();
    const { mutate: deleteVisiteur, isPending: isDeleting } =
        useDeleteVisiteur();
    const { isAdmin } = useAuthStore();
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [visiteurToEdit, setVisiteurToEdit] = useState<Visiteur | null>(null);
    const [toDelete, setToDelete] = useState<Visiteur | null>(null);

    if (isLoading) return <PageSkeleton />;
    if (isError)
        return (
            <p className="text-destructive">
                Erreur lors du chargement des visiteurs.
            </p>
        );

    const filtered = visiteurs.filter((v) => {
        const q = search.toLowerCase();
        return (
            v.prenom.toLowerCase().includes(q) ||
            v.nom.toLowerCase().includes(q)
        );
    });

    const handleCardClick = (id: number) => {
        router.push(`/visiteurs/${id}`);
    };

    const handleEdit = (e: React.MouseEvent, v: Visiteur) => {
        e.stopPropagation();
        setVisiteurToEdit(v);
    };

    const handleDeleteClick = (e: React.MouseEvent, v: Visiteur) => {
        e.stopPropagation();
        setToDelete(v);
    };

    const handleConfirmDelete = () => {
        if (!toDelete) return;
        deleteVisiteur(toDelete.id, {
            onSuccess: () => setToDelete(null),
        });
    };

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Visiteurs
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {visiteurs.length} visiteur
                        {visiteurs.length > 1 ? "s" : ""} enregistré
                        {visiteurs.length > 1 ? "s" : ""}
                    </p>
                </div>
                {isAdmin() && (
                    <Button
                        onClick={() => {
                            setVisiteurToEdit(null);
                            setModalOpen(true);
                        }}
                        className="gap-2 shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter
                    </Button>
                )}
            </div>

            {/* ── Search ── */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                    placeholder="Rechercher par prénom ou nom…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* ── Grid ── */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((v) => {
                        const nonTermines = v.objets.filter(
                            (o) =>
                                o.statut === "en_attente" ||
                                o.statut === "en_cours",
                        ).length;

                        return (
                            <Card
                                key={v.id}
                                className="group relative hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleCardClick(v.id)}
                            >
                                <CardContent className="p-5 space-y-3">
                                    {/* Avatar + nom + actions */}
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                            {initialsFromParts(v.prenom, v.nom)}
                                        </div>

                                        {/* Nom complet */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold leading-tight truncate">
                                                {v.civilite} {v.prenom}{" "}
                                                <span className="uppercase">
                                                    {v.nom}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Admin actions — visible on hover */}
                                        {isAdmin() && (
                                            <div
                                                className={cn(
                                                    "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0",
                                                )}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                                                    onClick={(e) =>
                                                        handleEdit(e, v)
                                                    }
                                                    title="Modifier"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                    onClick={(e) =>
                                                        handleDeleteClick(e, v)
                                                    }
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contact */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Mail className="h-3 w-3 shrink-0" />
                                            <span className="truncate">
                                                {v.email}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Phone className="h-3 w-3 shrink-0" />
                                            <span>
                                                {formatPhone(v.telephone)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Objets */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Package className="h-3 w-3 shrink-0" />
                                            <span>
                                                {v.objets.length === 0
                                                    ? "Aucun objet"
                                                    : `${v.objets.length} objet${v.objets.length > 1 ? "s" : ""}`}
                                            </span>
                                        </div>
                                        {nonTermines > 0 && (
                                            <Badge
                                                variant="warning"
                                                className="text-[10px] h-4 px-1.5"
                                            >
                                                {nonTermines} en attente/cours
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Source + date */}
                                    <div className="space-y-1 pt-1 border-t border-border/50">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Info className="h-3 w-3 shrink-0" />
                                            <span>{v.connu}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3 shrink-0" />
                                            <span>
                                                Inscrit le{" "}
                                                {formatDateShort(v.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Aucun visiteur trouvé</p>
                    {search && (
                        <p className="text-sm mt-1">
                            Aucun résultat pour &laquo;&nbsp;{search}
                            &nbsp;&raquo;
                        </p>
                    )}
                </div>
            )}

            {/* ── Modales ── */}
            <VisiteurModal
                open={modalOpen || !!visiteurToEdit}
                onOpenChange={(open) => {
                    if (!open) {
                        setModalOpen(false);
                        setVisiteurToEdit(null);
                    }
                }}
                visiteur={visiteurToEdit ?? undefined}
            />

            <DeleteConfirm
                open={!!toDelete}
                onOpenChange={(open) => !open && setToDelete(null)}
                name={`${toDelete?.prenom ?? ""} ${toDelete?.nom ?? ""}`}
                isPending={isDeleting}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
