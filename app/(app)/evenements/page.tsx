"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Calendar,
    MapPin,
    Navigation,
    Pencil,
    Trash2,
} from "lucide-react";
import { useEvenements, useDeleteEvenement } from "@/hooks/useEvenements";
import { useAuthStore } from "@/store/auth";
import { EvenementModal } from "@/components/modals/EvenementModal";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime, isFuture, isPast, cn } from "@/lib/utils";
import type { Evenement } from "@/types/evenement";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-44 bg-muted rounded" />
                    <div className="h-4 w-28 bg-muted rounded" />
                </div>
                <div className="h-9 w-28 bg-muted rounded" />
            </div>
            {[0, 1].map((s) => (
                <div key={s} className="space-y-3">
                    <div className="h-5 w-24 bg-muted rounded" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-44 bg-muted rounded-lg" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Event card ────────────────────────────────────────────────────────────────

interface EventCardProps {
    event: Evenement;
    onEdit: (e: React.MouseEvent, ev: Evenement) => void;
    onDelete: (e: React.MouseEvent, ev: Evenement) => void;
    showAdmin: boolean;
}

function EventCard({ event: ev, onEdit, onDelete, showAdmin }: EventCardProps) {
    const router = useRouter();
    const future = isFuture(ev.date);

    return (
        <Card
            className="group relative hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/evenements/${ev.id}`)}
        >
            <CardContent className="p-5 space-y-3">
                {/* Badge statut + actions */}
                <div className="flex items-start justify-between gap-2">
                    <Badge variant={future ? "success" : "secondary"}>
                        {future ? "À venir" : "Passé"}
                    </Badge>

                    {showAdmin && (
                        <div
                            className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-primary"
                                onClick={(e) => onEdit(e, ev)}
                                title="Modifier"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={(e) => onDelete(e, ev)}
                                title="Supprimer"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Nom */}
                <p className="font-bold text-base leading-snug">{ev.nom}</p>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>{formatDateTime(ev.date)}</span>
                </div>

                {/* Lieu + ville */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                        {ev.lieu} — {ev.ville}
                    </span>
                </div>

                {/* Adresse */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Navigation className="h-3 w-3 shrink-0" />
                    <span className="truncate">{ev.adresse}</span>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Section ───────────────────────────────────────────────────────────────────

interface SectionProps {
    title: string;
    events: Evenement[];
    emptyLabel: string;
    onEdit: (e: React.MouseEvent, ev: Evenement) => void;
    onDelete: (e: React.MouseEvent, ev: Evenement) => void;
    showAdmin: boolean;
}

function Section({
    title,
    events,
    emptyLabel,
    onEdit,
    onDelete,
    showAdmin,
}: SectionProps) {
    return (
        <section className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {events.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                    {emptyLabel}
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.map((ev) => (
                        <EventCard
                            key={ev.id}
                            event={ev}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            showAdmin={showAdmin}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EvenementsPage() {
    const { data: evenements = [], isLoading, isError } = useEvenements();
    const { mutate: deleteEvenement, isPending: isDeleting } =
        useDeleteEvenement();
    const { isAdmin } = useAuthStore();

    const [modalOpen, setModalOpen] = useState(false);
    const [evenementToEdit, setEvenementToEdit] = useState<Evenement | null>(
        null,
    );
    const [toDelete, setToDelete] = useState<Evenement | null>(null);

    if (isLoading) return <PageSkeleton />;
    if (isError)
        return (
            <p className="text-destructive">
                Erreur lors du chargement des événements.
            </p>
        );

    const aVenir = evenements
        .filter((e) => isFuture(e.date))
        .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

    const passes = evenements
        .filter((e) => isPast(e.date))
        .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

    const handleEdit = (e: React.MouseEvent, ev: Evenement) => {
        e.stopPropagation();
        setEvenementToEdit(ev);
    };

    const handleDeleteClick = (e: React.MouseEvent, ev: Evenement) => {
        e.stopPropagation();
        setToDelete(ev);
    };

    const handleConfirmDelete = () => {
        if (!toDelete) return;
        deleteEvenement(toDelete.id, {
            onSuccess: () => setToDelete(null),
        });
    };

    const admin = isAdmin();

    return (
        <div className="space-y-8">
            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Événements
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {evenements.length} événement
                        {evenements.length > 1 ? "s" : ""} au total
                    </p>
                </div>
                {admin && (
                    <Button
                        onClick={() => {
                            setEvenementToEdit(null);
                            setModalOpen(true);
                        }}
                        className="gap-2 shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter
                    </Button>
                )}
            </div>

            {/* ── Sections ── */}
            <Section
                title="À venir"
                events={aVenir}
                emptyLabel="Aucun événement à venir."
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                showAdmin={admin}
            />

            <Section
                title="Passés"
                events={passes}
                emptyLabel="Aucun événement passé."
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                showAdmin={admin}
            />

            {/* ── Modales ── */}
            <EvenementModal
                open={modalOpen || !!evenementToEdit}
                onOpenChange={(open) => {
                    if (!open) {
                        setModalOpen(false);
                        setEvenementToEdit(null);
                    }
                }}
                evenement={evenementToEdit ?? undefined}
            />

            <DeleteConfirm
                open={!!toDelete}
                onOpenChange={(open) => !open && setToDelete(null)}
                name={toDelete?.nom ?? ""}
                isPending={isDeleting}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
