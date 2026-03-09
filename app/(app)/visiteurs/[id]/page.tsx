"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, Trash2, CheckCircle2, Clock, Package, Ticket,
} from "lucide-react";
import { useVisiteur, useToggleObjet, useDeleteObjet } from "@/hooks/useVisiteurs";
import { ObjetModal } from "@/components/modals/ObjetModal";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { initials } from "@/lib/utils";
import type { Objet } from "@/types/objet";

const OBJET_EMOJI: Record<string, string> = {
  Sac: "👜",
  Vêtement: "👕",
  Bijou: "💍",
  Électronique: "📱",
  Autre: "📦",
};

export default function VisiteurDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const visiteurId = Number(id);

  const { data: visiteur, isLoading, isError } = useVisiteur(visiteurId);
  const { mutate: toggleObjet } = useToggleObjet();
  const { mutate: deleteObjet, isPending: isDeletingObjet } = useDeleteObjet();

  const [objetModalOpen, setObjetModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Objet | null>(null);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !visiteur) return (
    <div className="text-center py-16">
      <p className="text-destructive">Visiteur introuvable.</p>
      <Button variant="ghost" className="mt-4 gap-2" onClick={() => router.push("/visiteurs")}>
        <ArrowLeft className="h-4 w-4" /> Retour
      </Button>
    </div>
  );

  const enAttente = visiteur.objets.filter((o) => !o.restitue).length;
  const restitues = visiteur.objets.filter((o) => o.restitue).length;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-muted-foreground" onClick={() => router.push("/visiteurs")}>
        <ArrowLeft className="h-4 w-4" /> Retour aux visiteurs
      </Button>

      {/* Header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
              {initials(visiteur.nom)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold">{visiteur.nom}</h1>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Ticket className="h-3.5 w-3.5" /> {visiteur.billet}
                </span>
                <Badge variant="outline">{visiteur.evenement}</Badge>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{visiteur.objets.length}</p>
              <p className="text-xs text-muted-foreground">Total objets</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{enAttente}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{restitues}</p>
              <p className="text-xs text-muted-foreground">Restitués</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objets section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Objets déposés</h2>
          <Button size="sm" className="gap-2" onClick={() => setObjetModalOpen(true)}>
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>

        {visiteur.objets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun objet déposé</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {visiteur.objets.map((o) => (
              <Card key={o.id} className="group hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Emoji */}
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0">
                    {OBJET_EMOJI[o.type] ?? "📦"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{o.type}</p>
                    <p className="text-xs text-muted-foreground truncate">{o.description}</p>
                  </div>

                  {/* Status + actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={o.restitue ? "success" : "warning"} className="gap-1">
                      {o.restitue
                        ? <><CheckCircle2 className="h-3 w-3" /> Restitué</>
                        : <><Clock className="h-3 w-3" /> En attente</>
                      }
                    </Badge>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => toggleObjet({ visiteurId, objetId: o.id, restitue: !o.restitue })}
                    >
                      {o.restitue ? "Annuler" : "Restituer"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => setToDelete(o)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ObjetModal open={objetModalOpen} onOpenChange={setObjetModalOpen} visiteurId={visiteurId} />
      <DeleteConfirm
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        name={toDelete ? `${toDelete.type} – ${toDelete.description}` : ""}
        isPending={isDeletingObjet}
        onConfirm={() => {
          if (toDelete) {
            deleteObjet(
              { visiteurId, objetId: toDelete.id },
              { onSuccess: () => setToDelete(null) }
            );
          }
        }}
      />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl animate-pulse">
      <div className="h-8 w-32 bg-muted rounded" />
      <div className="h-40 bg-muted rounded-lg" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded-lg" />)}
      </div>
    </div>
  );
}
