"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Navigation,
    Plus,
    Pencil,
    Trash2,
    Users,
    User,
    Package,
} from "lucide-react";
import { useEvenement, useDeleteEvenement } from "@/hooks/useEvenements";
import { useRdvs, useDeleteRdv } from "@/hooks/useRdvs";
import { useVisiteurs } from "@/hooks/useVisiteurs";
import { useBenevoles } from "@/hooks/useBenevoles";
import { useAuthStore } from "@/store/auth";
import { EvenementModal } from "@/components/modals/EvenementModal";
import { RdvModal } from "@/components/modals/RdvModal";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, isFuture, isPast } from "@/lib/utils";
import { STATUTS_OBJET } from "@/types/objet";
import type { Rdv } from "@/types/rdv";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-5 w-24 bg-muted rounded" />
            <div className="h-44 bg-muted rounded-xl" />
            <div className="h-6 w-40 bg-muted rounded" />
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 bg-muted rounded-lg" />
                ))}
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EvenementDetailPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const router = useRouter();
    const { isAdmin } = useAuthStore();

    const id = Number(eventId);

    const { data: evenement, isLoading: loadingEvent, isError: errorEvent } =
        useEvenement(id);
    const { data: rdvs = [], isLoading: loadingRdvs } = useRdvs({
        evenementId: id,
    });
    const { data: visiteurs = [] } = useVisiteurs();
    const { data: benevoles = [] } = useBenevoles();
    const { mutate: deleteEvenement, isPending: isDeletingEvent } =
        useDeleteEvenement();
    const { mutate: deleteRdv, isPending: isDeletingRdv } = useDeleteRdv();

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [rdvModalOpen, setRdvModalOpen] = useState(false);
    const [deleteEventOpen, setDeleteEventOpen] = useState(false);
    const [rdvToDelete, setRdvToDelete] = useState<Rdv | null>(null);

    if (loadingEvent || loadingRdvs) return <PageSkeleton />;

    if (errorEvent || !evenement) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Événement introuvable.</p>
                <Button
                    variant="ghost"
                    className="mt-4 gap-1.5"
                    onClick={() => router.push("/evenements")}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour aux événements
                </Button>
            </div>
        );
    }

    const admin = isAdmin();
    const future = isFuture(evenement.date);

    const handleConfirmDeleteEvent = () => {
        deleteEvenement(id, {
            onSuccess: () => {
                setDeleteEventOpen(false);
                router.push("/evenements");
            },
        });
    };

    const handleConfirmDeleteRdv = () => {
        if (!rdvToDelete) return;
        deleteRdv(rdvToDelete.id, {
            onSuccess: () => setRdvToDelete(null),
        });
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* ── Retour + breadcrumb ── */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/evenements")}
                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                </Button>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-muted-foreground truncate">
                    {evenement.nom}
                </span>
            </div>

            {/* ── Card en-tête ── */}
            <Card>
                <CardContent className="p-6 space-y-4">
                    {/* Badge + actions admin */}
                    <div className="flex items-start justify-between gap-4">
                        <Badge variant={future ? "success" : "secondary"}>
                            {future ? "À venir" : "Passé"}
                        </Badge>

                        {admin && (
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditModalOpen(true)}
                                    className="gap-1.5"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Modifier
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setDeleteEventOpen(true)}
                                    className="gap-1.5"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Supprimer
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Nom */}
                    <h1 className="text-2xl font-bold tracking-tight leading-tight">
                        {evenement.nom}
                    </h1>

                    {/* Infos */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>{formatDateTime(evenement.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>
                                {evenement.lieu} — {evenement.ville}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Navigation className="h-3.5 w-3.5 shrink-0" />
                            <span>{evenement.adresse}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Section RDVs ── */}
            <section className="space-y-4">
                {/* Titre section */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold tracking-tight">
                            Rendez-vous
                        </h2>
                        <Badge variant="secondary" className="text-xs">
                            {rdvs.length}
                        </Badge>
                    </div>
                    {admin && (
                        <Button
                            size="sm"
                            onClick={() => setRdvModalOpen(true)}
                            className="gap-1.5 shrink-0"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Ajouter un RDV
                        </Button>
                    )}
                </div>

                {/* Liste des RDVs */}
                {rdvs.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">Aucun rendez-vous</p>
                        {admin && (
                            <p className="text-xs mt-1">
                                Cliquez sur &laquo;&nbsp;Ajouter un RDV&nbsp;&raquo; pour commencer.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rdvs.map((rdv) => {
                            const visiteur = visiteurs.find(
                                (v) => v.id === rdv.visiteurId,
                            );
                            const objet = visiteur?.objets.find(
                                (o) => o.id === rdv.objetId,
                            );
                            const benevole = benevoles.find(
                                (b) => b.id === objet?.benevoleId,
                            );
                            const statutInfo = objet
                                ? STATUTS_OBJET[objet.statut]
                                : null;

                            return (
                                <Card
                                    key={rdv.id}
                                    className="group hover:shadow-sm transition-shadow"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            {/* Icône visiteur */}
                                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                                <User className="h-4 w-4" />
                                            </div>

                                            {/* Contenu */}
                                            <div className="flex-1 min-w-0 space-y-1.5">
                                                {/* Visiteur */}
                                                {visiteur ? (
                                                    <button
                                                        className="text-sm font-semibold text-primary hover:underline text-left leading-tight"
                                                        onClick={() =>
                                                            router.push(
                                                                `/visiteurs/${visiteur.id}`,
                                                            )
                                                        }
                                                    >
                                                        {visiteur.civilite}{" "}
                                                        {visiteur.prenom}{" "}
                                                        {visiteur.nom.toUpperCase()}
                                                    </button>
                                                ) : (
                                                    <p className="text-sm font-semibold text-muted-foreground italic">
                                                        Visiteur inconnu
                                                    </p>
                                                )}

                                                {/* Objet */}
                                                {objet ? (
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <div className="flex items-center gap-1.5 text-sm">
                                                            <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                            <span className="font-medium">
                                                                {objet.nom}
                                                            </span>
                                                            {objet.marque && (
                                                                <span className="text-muted-foreground">
                                                                    {objet.marque}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {statutInfo && (
                                                            <span
                                                                className={`${statutInfo.color} text-xs font-medium px-2 py-0.5 rounded-full`}
                                                            >
                                                                {statutInfo.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">
                                                        Objet inconnu
                                                    </p>
                                                )}

                                                {/* Bénévole */}
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <User className="h-3 w-3 text-muted-foreground shrink-0" />
                                                    {benevole ? (
                                                        <span className="font-medium">
                                                            {benevole.prenom}{" "}
                                                            {benevole.nom.toUpperCase()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">
                                                            Non assigné
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Admin: supprimer */}
                                            {admin && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() =>
                                                        setRdvToDelete(rdv)
                                                    }
                                                    title="Supprimer le RDV"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── Modales ── */}
            <EvenementModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                evenement={evenement}
            />

            <RdvModal
                open={rdvModalOpen}
                onOpenChange={setRdvModalOpen}
                evenementId={id}
            />

            <DeleteConfirm
                open={deleteEventOpen}
                onOpenChange={setDeleteEventOpen}
                name={evenement.nom}
                isPending={isDeletingEvent}
                onConfirm={handleConfirmDeleteEvent}
            />

            <DeleteConfirm
                open={!!rdvToDelete}
                onOpenChange={(open) => !open && setRdvToDelete(null)}
                name={
                    rdvToDelete
                        ? (() => {
                              const v = visiteurs.find(
                                  (vv) => vv.id === rdvToDelete.visiteurId,
                              );
                              const o = v?.objets.find(
                                  (oo) => oo.id === rdvToDelete.objetId,
                              );
                              return o
                                  ? `le RDV pour "${o.nom}"`
                                  : "ce rendez-vous";
                          })()
                        : ""
                }
                isPending={isDeletingRdv}
                onConfirm={handleConfirmDeleteRdv}
            />
        </div>
    );
}
