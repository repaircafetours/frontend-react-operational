"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Mail,
    Phone,
    Info,
    Calendar,
    Plus,
    Trash2,
    Pencil,
    Zap,
    AlertTriangle,
    Package,
} from "lucide-react";
import { useVisiteur, useDeleteVisiteur, useDeleteObjet } from "@/hooks/useVisiteurs";
import { useAuthStore } from "@/store/auth";
import { VisiteurModal } from "@/components/modals/VisiteurModal";
import { ObjetModal } from "@/components/modals/ObjetModal";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    initialsFromParts,
    formatPhone,
    formatDate,
    truncate,
} from "@/lib/utils";
import { STATUTS_OBJET } from "@/types/objet";
import type { ObjetAReparer } from "@/types/objet";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-5 w-24 bg-muted rounded" />
            <div className="h-32 bg-muted rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48 bg-muted rounded-xl" />
                <div className="h-48 bg-muted rounded-xl" />
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function VisiteurDetailPage() {
    const { visiteurId } = useParams<{ visiteurId: string }>();
    const router = useRouter();
    const { isAdmin } = useAuthStore();

    const id = Number(visiteurId);
    const { data: visiteur, isLoading, isError } = useVisiteur(id);
    const { mutate: deleteVisiteur, isPending: isDeletingVisiteur } =
        useDeleteVisiteur();
    const { mutate: deleteObjet, isPending: isDeletingObjet } = useDeleteObjet();

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [objetModalOpen, setObjetModalOpen] = useState(false);
    const [objetToDelete, setObjetToDelete] = useState<ObjetAReparer | null>(
        null,
    );
    const [deleteVisiteurOpen, setDeleteVisiteurOpen] = useState(false);

    if (isLoading) return <PageSkeleton />;
    if (isError || !visiteur)
        return (
            <p className="text-destructive">Visiteur introuvable.</p>
        );

    const nomComplet = `${visiteur.civilite} ${visiteur.prenom} ${visiteur.nom.toUpperCase()}`;

    const handleConfirmDeleteObjet = () => {
        if (!objetToDelete) return;
        deleteObjet(
            { visiteurId: id, objetId: objetToDelete.id },
            { onSuccess: () => setObjetToDelete(null) },
        );
    };

    const handleConfirmDeleteVisiteur = () => {
        deleteVisiteur(id, {
            onSuccess: () => {
                setDeleteVisiteurOpen(false);
                router.push("/visiteurs");
            },
        });
    };

    return (
        <div className="space-y-6 max-w-5xl">
            {/* ── Breadcrumb ── */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/visiteurs")}
                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                </Button>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-muted-foreground truncate">
                    {nomComplet}
                </span>
            </div>

            {/* ── En-tête ── */}
            <Card>
                <CardContent className="p-6 flex items-center gap-5">
                    {/* Avatar grand */}
                    <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                        {initialsFromParts(visiteur.prenom, visiteur.nom)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight leading-tight">
                            {nomComplet}
                        </h1>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>
                                Inscrit le {formatDate(visiteur.createdAt)}
                            </span>
                        </div>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                        {visiteur.objets.length} objet
                        {visiteur.objets.length > 1 ? "s" : ""}
                    </Badge>
                </CardContent>
            </Card>

            {/* ── Contenu principal ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ── Informations ── */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-base">
                                Informations
                            </h2>
                            {isAdmin() && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditModalOpen(true)}
                                    className="gap-1.5"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Modifier
                                </Button>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">
                                        Email
                                    </p>
                                    <p className="text-sm break-all">
                                        {visiteur.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">
                                        Téléphone
                                    </p>
                                    <p className="text-sm">
                                        {formatPhone(visiteur.telephone)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">
                                        Comment a-t-il connu l&apos;association ?
                                    </p>
                                    <p className="text-sm">{visiteur.connu}</p>
                                </div>
                            </div>
                        </div>

                        {/* Supprimer visiteur */}
                        {isAdmin() && (
                            <>
                                <Separator />
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="w-full gap-2"
                                    onClick={() =>
                                        setDeleteVisiteurOpen(true)
                                    }
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Supprimer le visiteur
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* ── Objets à réparer ── */}
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold text-base">
                                    Objets à réparer
                                </h2>
                                <Badge variant="secondary" className="text-xs">
                                    {visiteur.objets.length}
                                </Badge>
                            </div>
                            {isAdmin() && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setObjetModalOpen(true)}
                                    className="gap-1.5"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Ajouter
                                </Button>
                            )}
                        </div>

                        <Separator />

                        {visiteur.objets.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Aucun objet enregistré</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {visiteur.objets.map((o) => (
                                    <div
                                        key={o.id}
                                        className="group flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/40 cursor-pointer transition-colors"
                                        onClick={() =>
                                            router.push(
                                                `/visiteurs/object/${o.id}`,
                                            )
                                        }
                                    >
                                        <div className="flex-1 min-w-0 space-y-1">
                                            {/* Nom + marque + badge statut */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-sm">
                                                    {o.nom}
                                                </span>
                                                {o.marque && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {o.marque}
                                                    </span>
                                                )}
                                                <span
                                                    className={`${STATUTS_OBJET[o.statut].color} text-xs font-medium px-2 py-0.5 rounded-full`}
                                                >
                                                    {STATUTS_OBJET[o.statut].label}
                                                </span>
                                            </div>

                                            {/* Alertes */}
                                            <div className="flex items-center gap-2">
                                                {o.faitDisjoncter && (
                                                    <Zap className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                                )}
                                                {o.risqueElectrique && (
                                                    <AlertTriangle className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                                                )}
                                            </div>

                                            {/* Description */}
                                            {o.description && (
                                                <p className="text-xs text-muted-foreground">
                                                    {truncate(o.description, 60)}
                                                </p>
                                            )}
                                        </div>

                                        {/* Admin: supprimer */}
                                        {isAdmin() && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setObjetToDelete(o);
                                                }}
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── Modales ── */}
            <VisiteurModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                visiteur={visiteur}
            />

            <ObjetModal
                open={objetModalOpen}
                onOpenChange={setObjetModalOpen}
                visiteurId={id}
            />

            <DeleteConfirm
                open={!!objetToDelete}
                onOpenChange={(open) => !open && setObjetToDelete(null)}
                name={objetToDelete?.nom ?? ""}
                isPending={isDeletingObjet}
                onConfirm={handleConfirmDeleteObjet}
            />

            <DeleteConfirm
                open={deleteVisiteurOpen}
                onOpenChange={setDeleteVisiteurOpen}
                name={nomComplet}
                isPending={isDeletingVisiteur}
                onConfirm={handleConfirmDeleteVisiteur}
            />
        </div>
    );
}
