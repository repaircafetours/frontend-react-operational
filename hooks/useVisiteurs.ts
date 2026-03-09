import { Objet, ObjetFormData } from "@/types/objet";
import { Visiteur, VisiteurFormData } from "@/types/visitor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Query keys ────────────────────────────────────────────────────────────────

export const visiteurKeys = {
  all: ["visiteurs"] as const,
  list: () => [...visiteurKeys.all, "list"] as const,
  detail: (id: number) => [...visiteurKeys.all, "detail", id] as const,
};

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchVisiteurs(): Promise<Visiteur[]> {
  const res = await fetch("/api/visiteurs");
  if (!res.ok) throw new Error("Erreur lors du chargement des visiteurs");
  return res.json();
}

async function fetchVisiteur(id: number): Promise<Visiteur> {
  const res = await fetch(`/api/visiteurs/${id}`);
  if (!res.ok) throw new Error("Visiteur introuvable");
  return res.json();
}

async function createVisiteur(data: VisiteurFormData): Promise<Visiteur> {
  const res = await fetch("/api/visiteurs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur lors de la création");
  return res.json();
}

async function deleteVisiteur(id: number): Promise<void> {
  const res = await fetch(`/api/visiteurs/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
}

async function addObjet({
  visiteurId,
  data,
}: {
  visiteurId: number;
  data: ObjetFormData;
}): Promise<Objet> {
  const res = await fetch(`/api/visiteurs/${visiteurId}/objets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur lors de l'ajout");
  return res.json();
}

async function toggleObjet({
  visiteurId,
  objetId,
  restitue,
}: {
  visiteurId: number;
  objetId: number;
  restitue: boolean;
}): Promise<Objet> {
  const res = await fetch(`/api/visiteurs/${visiteurId}/objets/${objetId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ restitue }),
  });
  if (!res.ok) throw new Error("Erreur lors de la mise à jour");
  return res.json();
}

async function deleteObjet({
  visiteurId,
  objetId,
}: {
  visiteurId: number;
  objetId: number;
}): Promise<void> {
  const res = await fetch(`/api/visiteurs/${visiteurId}/objets/${objetId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useVisiteurs() {
  return useQuery<Visiteur[], Error>({
    queryKey: visiteurKeys.list(),
    queryFn: fetchVisiteurs,
  });
}

export function useVisiteur(id: number) {
  return useQuery<Visiteur, Error>({
    queryKey: visiteurKeys.detail(id),
    queryFn: () => fetchVisiteur(id),
    enabled: id > 0,
  });
}

export function useCreateVisiteur() {
  const qc = useQueryClient();
  return useMutation<Visiteur, Error, VisiteurFormData>({
    mutationFn: createVisiteur,
    onSuccess: () => qc.invalidateQueries({ queryKey: visiteurKeys.list() }),
  });
}

export function useDeleteVisiteur() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteVisiteur,
    onSuccess: () => qc.invalidateQueries({ queryKey: visiteurKeys.list() }),
  });
}

export function useAddObjet() {
  const qc = useQueryClient();
  return useMutation<Objet, Error, { visiteurId: number; data: ObjetFormData }>({
    mutationFn: addObjet,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: visiteurKeys.detail(variables.visiteurId) });
      qc.invalidateQueries({ queryKey: visiteurKeys.list() });
    },
  });
}

export function useToggleObjet() {
  const qc = useQueryClient();
  return useMutation<
    Objet,
    Error,
    { visiteurId: number; objetId: number; restitue: boolean }
  >({
    mutationFn: toggleObjet,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: visiteurKeys.detail(variables.visiteurId) });
    },
  });
}

export function useDeleteObjet() {
  const qc = useQueryClient();
  return useMutation<void, Error, { visiteurId: number; objetId: number }>({
    mutationFn: deleteObjet,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: visiteurKeys.detail(variables.visiteurId) });
      qc.invalidateQueries({ queryKey: visiteurKeys.list() });
    },
  });
}
