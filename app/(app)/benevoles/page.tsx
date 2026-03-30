"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { useBenevoles, useDeleteBenevole } from "@/hooks/useBenevoles";
import { useAuthStore } from "@/store/auth";
import { BenevoleModal } from "@/components/modals/BenevoleModal";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, initialsFromParts } from "@/lib/utils";
import { CATEGORIES_BENEVOLE, type CategorieBenevole } from "@/types/benevole";
import type { Benevole } from "@/types/benevole";

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterCategorie = CategorieBenevole | "tous";

// ── Constants ─────────────────────────────────────────────────────────────────

const FILTER_BUTTONS: { value: FilterCategorie; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "reparateur", label: "Réparateurs" },
  { value: "operationnel", label: "Opérationnels" },
  { value: "intendant", label: "Intendants" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BenevolesPage() {
  const router = useRouter();
  const { data: benevoles = [], isLoading, isError } = useBenevoles();
  const { mutate: deleteBenevole, isPending: isDeleting } = useDeleteBenevole();
  const { isAdmin } = useAuthStore();

  const [filterCategorie, setFilterCategorie] =
    useState<FilterCategorie>("tous");
  const [filtreActif, setFiltreActif] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [benevoleToEdit, setBenevoleToEdit] = useState<Benevole | null>(null);
  const [toDelete, setToDelete] = useState<Benevole | null>(null);

  if (isLoading) return <PageSkeleton />;
  if (isError)
    return <p className="text-destructive">Erreur lors du chargement.</p>;

  const benevolesActifs = benevoles.filter((b) => b.actif);

  const filtered = benevoles
    .filter(
      (b) => filterCategorie === "tous" || b.categorie === filterCategorie,
    )
    .filter((b) => !filtreActif || b.actif);

  const handleOpenModal = (b: Benevole | null) => {
    setBenevoleToEdit(b);
    setModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setModalOpen(open);
    if (!open) setBenevoleToEdit(null);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bénévoles</h1>
          <p className="text-muted-foreground mt-1">
            {benevolesActifs.length} actif
            {benevolesActifs.length > 1 ? "s" : ""} sur {benevoles.length} au
            total
          </p>
        </div>
        {isAdmin() && (
          <Button onClick={() => handleOpenModal(null)} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        )}
      </div>

      {/* ── Filtres ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_BUTTONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilterCategorie(value)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                filterCategorie === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filtreActif}
            onChange={(e) => setFiltreActif(e.target.checked)}
            className="rounded"
          />
          Actifs seulement
        </label>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Aucun bénévole trouvé</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4 border-b">
                  Bénévole
                </th>
                <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4 border-b">
                  Catégorie
                </th>
                <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4 border-b">
                  Secteurs
                </th>
                <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4 border-b">
                  Statut
                </th>
                {isAdmin() && (
                  <th className="text-xs uppercase text-muted-foreground font-medium text-left py-3 px-4 border-b">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-muted/40 transition-colors border-b border-border/50 cursor-pointer last:border-0"
                  onClick={() => router.push(`/benevoles/${b.id}`)}
                >
                  {/* ── Bénévole ── */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {initialsFromParts(b.prenom, b.nom)}
                      </div>
                      <span className="font-medium">
                        {b.prenom} <span className="uppercase">{b.nom}</span>
                      </span>
                    </div>
                  </td>

                  {/* ── Catégorie ── */}
                  <td className="py-3 px-4">
                    <Badge variant={b.categorie}>
                      {CATEGORIES_BENEVOLE[b.categorie]}
                    </Badge>
                  </td>

                  {/* ── Secteurs ── */}
                  <td className="py-3 px-4">
                    {b.categorie === "reparateur" && b.secteurs.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {b.secteurs.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground"
                          >
                            {s}
                          </span>
                        ))}
                        {b.secteurs.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                            +{b.secteurs.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>

                  {/* ── Statut ── */}
                  <td className="py-3 px-4">
                    {b.actif ? (
                      <Badge variant="success">Actif</Badge>
                    ) : (
                      <Badge variant="secondary">Inactif</Badge>
                    )}
                  </td>

                  {/* ── Actions admin ── */}
                  {isAdmin() && (
                    <td
                      className="py-3 px-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleOpenModal(b)}
                          title="Modifier"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => setToDelete(b)}
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

      {/* ── Modals ── */}
      <BenevoleModal
        open={modalOpen || !!benevoleToEdit}
        onOpenChange={handleCloseModal}
        benevole={benevoleToEdit ?? undefined}
      />
      <DeleteConfirm
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        name={toDelete ? `${toDelete.prenom} ${toDelete.nom}` : ""}
        isPending={isDeleting}
        onConfirm={() => {
          if (toDelete)
            deleteBenevole(toDelete.id, {
              onSuccess: () => setToDelete(null),
            });
        }}
      />
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-9 w-40 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
        <div className="h-9 w-24 bg-muted rounded" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-24 bg-muted rounded-md" />
        ))}
      </div>
      <div className="rounded-lg border overflow-hidden">
        <div className="h-10 bg-muted/60 border-b" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-14 border-b last:border-0 bg-muted/20" />
        ))}
      </div>
    </div>
  );
}
