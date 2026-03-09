"use client";
import { useState } from "react";
import { Plus, Trash2, Calendar, Mail, Users } from "lucide-react";
import { useBenevoles, useDeleteBenevole } from "@/hooks/useBenevoles";
import { useAuthStore } from "@/store/auth";
import { BenevoleModal } from "@/components/modals/BenevoleModal";
import { DeleteConfirm } from "@/components/DeleteConfirm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { initials } from "@/lib/utils";
import type { Benevole } from "@/types/benevole";

export default function BenevolesPage() {
  const { data: benevoles = [], isLoading, isError } = useBenevoles();
  const { mutate: deleteBenevole, isPending: isDeleting } = useDeleteBenevole();
  const { isAdmin } = useAuthStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Benevole | null>(null);

  if (isLoading) return <PageSkeleton />;
  if (isError) return <p className="text-destructive">Erreur lors du chargement.</p>;

  const admins = benevoles.filter((b) => b.role === "admin");
  const benevolesList = benevoles.filter((b) => b.role === "benevole");

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bénévoles</h1>
          <p className="text-muted-foreground mt-1">
            {benevoles.length} bénévole{benevoles.length > 1 ? "s" : ""} enregistré{benevoles.length > 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin() && (
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: benevoles.length, color: "text-foreground" },
          { label: "Admins", value: admins.length, color: "text-violet-600" },
          { label: "Bénévoles", value: benevolesList.length, color: "text-sky-600" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {benevoles.map((b) => (
          <Card key={b.id} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {initials(b.nom)}
                </div>
                {isAdmin() && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    onClick={() => setToDelete(b)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <h3 className="font-semibold">{b.nom}</h3>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" /> {b.email}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" /> {b.disponibilite}
                </div>
              </div>
              <div className="mt-3">
                <Badge variant={b.role === "admin" ? "admin" : "benevole"}>
                  {b.role === "admin" ? "Admin" : "Bénévole"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {benevoles.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Aucun bénévole enregistré</p>
        </div>
      )}

      {/* Modals */}
      <BenevoleModal open={modalOpen} onOpenChange={setModalOpen} />
      <DeleteConfirm
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        name={toDelete?.nom ?? ""}
        isPending={isDeleting}
        onConfirm={() => {
          if (toDelete) deleteBenevole(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse">
      <div className="h-9 w-48 bg-muted rounded" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted rounded-lg" />)}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-36 bg-muted rounded-lg" />)}
      </div>
    </div>
  );
}
