import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Rdv, RdvFormData } from "@/types/rdv";

// ── Query keys ────────────────────────────────────────────────────────────────

export const rdvKeys = {
    all: ["rdvs"] as const,
    list: (filters?: { evenementId?: number; visiteurId?: number }) =>
        [...rdvKeys.all, "list", filters ?? {}] as const,
};

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchRdvs(filters?: {
    evenementId?: number;
    visiteurId?: number;
}): Promise<Rdv[]> {
    const params = new URLSearchParams();
    if (filters?.evenementId !== undefined)
        params.set("evenementId", String(filters.evenementId));
    if (filters?.visiteurId !== undefined)
        params.set("visiteurId", String(filters.visiteurId));

    const query = params.toString();
    const res = await fetch(`/api/rdvs${query ? `?${query}` : ""}`);
    if (!res.ok) throw new Error("Erreur lors du chargement des rendez-vous");
    return res.json();
}

async function createRdv(data: RdvFormData): Promise<Rdv> {
    const res = await fetch("/api/rdvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur lors de la création du rendez-vous");
    return res.json();
}

async function deleteRdv(id: number): Promise<void> {
    const res = await fetch(`/api/rdvs/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erreur lors de la suppression du rendez-vous");
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useRdvs(filters?: {
    evenementId?: number;
    visiteurId?: number;
}) {
    return useQuery<Rdv[], Error>({
        queryKey: rdvKeys.list(filters),
        queryFn: () => fetchRdvs(filters),
    });
}

export function useCreateRdv() {
    const qc = useQueryClient();
    return useMutation<Rdv, Error, RdvFormData>({
        mutationFn: createRdv,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: rdvKeys.all }),
    });
}

export function useDeleteRdv() {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: deleteRdv,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: rdvKeys.all }),
    });
}
