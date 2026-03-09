import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Benevole, BenevoleFormData } from "@/types/benevole";

// ── Query keys ────────────────────────────────────────────────────────────────

export const benevoleKeys = {
  all: ["benevoles"] as const,
  list: () => [...benevoleKeys.all, "list"] as const,
};

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchBenevoles(): Promise<Benevole[]> {
  const res = await fetch("/api/benevoles");
  if (!res.ok) throw new Error("Erreur lors du chargement des bénévoles");
  return res.json();
}

async function createBenevole(data: BenevoleFormData): Promise<Benevole> {
  const res = await fetch("/api/benevoles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur lors de la création");
  return res.json();
}

async function deleteBenevole(id: number): Promise<void> {
  const res = await fetch(`/api/benevoles/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useBenevoles() {
  return useQuery<Benevole[], Error>({
    queryKey: benevoleKeys.list(),
    queryFn: fetchBenevoles,
  });
}

export function useCreateBenevole() {
  const qc = useQueryClient();
  return useMutation<Benevole, Error, BenevoleFormData>({
    mutationFn: createBenevole,
    onSuccess: () => qc.invalidateQueries({ queryKey: benevoleKeys.list() }),
  });
}

export function useDeleteBenevole() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteBenevole,
    onSuccess: () => qc.invalidateQueries({ queryKey: benevoleKeys.list() }),
  });
}
