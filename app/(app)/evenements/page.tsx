"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Calendar,
  MapPin,
  Pencil,
  Trash2,
  CalendarCheck,
  CalendarDays,
} from "lucide-react";
import { useEvenements, useDeleteEvenement } from "@/hooks/useEvenements";
import { useRdvs } from "@/hooks/useRdvs";
import { useAuthStore } from "@/store/auth";
import { EvenementModal } from "@/components/modals/EvenementModal";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateTime, isFuture, isPast } from "@/lib/utils";
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
          <Card className="overflow-hidden">
            <div className="border-b h-10 bg-muted/40" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 border-b bg-muted/20" />
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}

// ── Table section ─────────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  events: Evenement[];
  emptyLabel: string;
  onEdit: (e: React.MouseEvent, ev: Evenement) => void;
  onDelete: (e: React.MouseEvent, ev: Evenement) => void;
  showAdmin: boolean;
  rdvCountByEvent: Record<number, number>;
  future: boolean;
}

function Section({
  title,
  events,
  emptyLabel,
  onEdit,
  onDelete,
  showAdmin,
  rdvCountByEvent,
  future,
}: SectionProps) {
  const router = useRouter();

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">{emptyLabel}</p>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4">
                  Nom
                </th>
                <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4">
                  Date
                </th>
                <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4">
                  Lieu
                </th>
                <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4">
                  Ville
                </th>
                <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4">
                  RDV
                </th>
                <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4">
                  Statut
                </th>
                {showAdmin && (
                  <th className="text-xs uppercase text-muted-foreground font-medium text-right py-3 px-4">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr
                  key={ev.id}
                  className="hover:bg-muted/40 transition-colors border-b border-border/50 last:border-0 cursor-pointer"
                  onClick={() => router.push(`/evenements/${ev.id}`)}
                >
                  {/* Nom */}
                  <td className="py-3 px-4 font-medium">{ev.nom}</td>

                  {/* Date */}
                  <td className="py-3 px-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span className="whitespace-nowrap">
                        {formatDateTime(ev.date)}
                      </span>
                    </div>
                  </td>

                  {/* Lieu */}
                  <td className="py-3 px-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate max-w-[160px]">{ev.lieu}</span>
                    </div>
                  </td>

                  {/* Ville */}
                  <td className="py-3 px-4 text-muted-foreground">
                    {ev.ville}
                  </td>

                  {/* RDV count */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <CalendarCheck className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-medium text-foreground">
                        {rdvCountByEvent[ev.id] ?? 0}
                      </span>
                    </span>
                  </td>

                  {/* Statut */}
                  <td className="py-3 px-4">
                    <Badge variant={future ? "success" : "secondary"}>
                      {future ? "À venir" : "Passé"}
                    </Badge>
                  </td>

                  {/* Actions admin */}
                  {showAdmin && (
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-1">
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
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EvenementsPage() {
  const { data: evenements = [], isLoading, isError } = useEvenements();
  const { mutate: deleteEvenement, isPending: isDeleting } =
    useDeleteEvenement();
  const { data: rdvs = [] } = useRdvs();
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
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const passes = evenements
    .filter((e) => isPast(e.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const rdvCountByEvent = rdvs.reduce<Record<number, number>>((acc, rdv) => {
    acc[rdv.evenementId] = (acc[rdv.evenementId] ?? 0) + 1;
    return acc;
  }, {});

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
          <div className="flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Événements</h1>
          </div>
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

      {/* ── À venir ── */}
      <Section
        title="À venir"
        events={aVenir}
        emptyLabel="Aucun événement à venir."
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        showAdmin={admin}
        rdvCountByEvent={rdvCountByEvent}
        future={true}
      />

      {/* ── Passés ── */}
      <Section
        title="Passés"
        events={passes}
        emptyLabel="Aucun événement passé."
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        showAdmin={admin}
        rdvCountByEvent={rdvCountByEvent}
        future={false}
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
