import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    Evenement,
    EvenementFormData,
    EvenementUpdateData,
} from "@/types/evenement";

// ── Query keys ────────────────────────────────────────────────────────────────

export const evenementKeys = {
    all: ["evenements"] as const,
    list: () => [...evenementKeys.all, "list"] as const,
    detail: (id: number) => [...evenementKeys.all, "detail", id] as const,
};

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchEvenements(): Promise<Evenement[]> {
    const res = await fetch("/api/evenements");
    if (!res.ok) throw new Error("Erreur lors du chargement des événements");
    return res.json();
}

async function fetchEvenement(id: number): Promise<Evenement> {
    const res = await fetch(`/api/evenements/${id}`);
    if (!res.ok) throw new Error("Événement introuvable");
    return res.json();
}

async function createEvenement(data: EvenementFormData): Promise<Evenement> {
    const res = await fetch("/api/evenements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur lors de la création de l'événement");
    return res.json();
}

async function updateEvenement({
    id,
    data,
}: {
    id: number;
    data: EvenementUpdateData;
}): Promise<Evenement> {
    const res = await fetch(`/api/evenements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok)
        throw new Error("Erreur lors de la mise à jour de l'événement");
    return res.json();
}

async function deleteEvenement(id: number): Promise<void> {
    const res = await fetch(`/api/evenements/${id}`, { method: "DELETE" });
    if (!res.ok)
        throw new Error("Erreur lors de la suppression de l'événement");
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useEvenements() {
    return useQuery<Evenement[], Error>({
        queryKey: evenementKeys.list(),
        queryFn: fetchEvenements,
    });
}

export function useEvenement(id: number) {
    return useQuery<Evenement, Error>({
        queryKey: evenementKeys.detail(id),
        queryFn: () => fetchEvenement(id),
        enabled: id > 0,
    });
}

export function useCreateEvenement() {
    const qc = useQueryClient();
    return useMutation<Evenement, Error, EvenementFormData>({
        mutationFn: createEvenement,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: evenementKeys.list() }),
    });
}

export function useUpdateEvenement() {
    const qc = useQueryClient();
    return useMutation<
        Evenement,
        Error,
        { id: number; data: EvenementUpdateData }
    >({
        mutationFn: updateEvenement,
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({
                queryKey: evenementKeys.detail(variables.id),
            });
            qc.invalidateQueries({ queryKey: evenementKeys.list() });
        },
    });
}

export function useDeleteEvenement() {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: deleteEvenement,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: evenementKeys.list() }),
    });
}
