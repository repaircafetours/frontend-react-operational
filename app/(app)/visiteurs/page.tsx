"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Eye, Ticket, Package } from "lucide-react";
import { useVisiteurs, useDeleteVisiteur } from "@/hooks/useVisiteurs";
import { useAuthStore } from "@/store/auth";
import { VisiteurModal } from "@/components/modals/VisiteurModal";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { initials } from "@/lib/utils";
import type { Visiteur } from "@/types/visitor";

export default function VisiteursPage() {
  const { data: visiteurs = [], isLoading, isError } = useVisiteurs();
  const { mutate: deleteVisiteur, isPending: isDeleting } = useDeleteVisiteur();
  const { isAdmin } = useAuthStore();
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Visiteur | null>(null);

  if (isLoading) return <PageSkeleton />;
  if (isError) return <p className="text-destructive">Erreur lors du chargement.</p>;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visiteurs</h1>
          <p className="text-muted-foreground mt-1">
            {visiteurs.length} visiteur{visiteurs.length > 1 ? "s" : ""} enregistré{visiteurs.length > 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin() && (
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        )}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visiteurs.map((v) => {
          const enAttente = v.objets.filter((o) => !o.restitue).length;
          return (
            <Card
              key={v.id}
              className="group hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/visiteurs/${v.id}`)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {initials(v.nom)}
                  </div>
                  <div
                    className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={(e) => { e.stopPropagation(); router.push(`/visiteurs/${v.id}`); }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {isAdmin() && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); setToDelete(v); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold">{v.nom}</h3>

                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Ticket className="h-3 w-3" /> {v.billet}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Package className="h-3 w-3" />
                    {v.objets.length === 0
                      ? "Aucun objet"
                      : `${v.objets.length} objet${v.objets.length > 1 ? "s" : ""}`}
                    {enAttente > 0 && (
                      <Badge variant="warning" className="text-[10px] h-4 px-1.5 ml-1">
                        {enAttente} en attente
                      </Badge>
                    )}
                  </div>
                </div>

                <Badge variant="outline" className="mt-3 text-xs">
                  {v.evenement}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty */}
      {visiteurs.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Ticket className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Aucun visiteur enregistré</p>
        </div>
      )}

      <VisiteurModal open={modalOpen} onOpenChange={setModalOpen} />
      <DeleteConfirm
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        name={toDelete?.nom ?? ""}
        isPending={isDeleting}
        onConfirm={() => {
          if (toDelete) deleteVisiteur(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse">
      <div className="h-9 w-40 bg-muted rounded" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-40 bg-muted rounded-lg" />)}
      </div>
    </div>
  );
}
