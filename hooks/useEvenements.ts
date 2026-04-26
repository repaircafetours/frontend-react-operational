import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiUrl } from "@/lib/config";
import { apiFetch, safeParseJson } from "@/lib/api";
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

// ── Mapping retour (backend → Evenement) ──────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBackendToEvenement(raw: any): Evenement {
    return {
        id: raw.id,
        nom: raw.city ?? raw.nom ?? `Événement #${raw.id}`,
        ville: raw.city ?? raw.ville ?? "",
        lieu: raw.lieu ?? "",
        adresse: raw.address ?? raw.adresse ?? "",
        zip_code: raw.zip_code,
        date: raw.date,
        createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
    };
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchEvenements(): Promise<Evenement[]> {
    const res = await apiFetch(apiUrl("/events"));
    if (!res.ok) throw new Error("Erreur lors du chargement des événements");
    const raws = await safeParseJson<Record<string, unknown>[]>(res, []);
    return raws.map(mapBackendToEvenement);
}

async function fetchEvenement(id: number): Promise<Evenement> {
    const res = await apiFetch(apiUrl(`/events/${id}`));
    if (!res.ok) throw new Error("Événement introuvable");
    const raw = await safeParseJson<Record<string, unknown>>(res, {});
    return mapBackendToEvenement(raw);
}

async function createEvenement(data: EvenementFormData): Promise<Evenement> {
    const backendPayload = {
        city: data.ville,
        zip_code: data.zip_code ?? "",
        address: data.adresse,
        // datetime-local donne "2026-05-30T22:00" → convertir en ISO microseconds (Laravel Y-m-d\TH:i:s.u\Z)
        date: data.date
            ? new Date(data.date)
                  .toISOString()
                  .replace(/\.(\d{3})Z$/, ".$1000Z")
            : data.date,
    };
    const res = await apiFetch(apiUrl("/events"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendPayload),
    });
    if (!res.ok) {
        const errBody = await safeParseJson<{ message?: string }>(res, {});
        throw new Error(
            errBody.message ?? "Erreur lors de la création de l'événement",
        );
    }
    const raw = await safeParseJson<Record<string, unknown>>(res, {});
    return mapBackendToEvenement(raw);
}

async function updateEvenement({
    id,
    data,
}: {
    id: number;
    data: EvenementUpdateData;
}): Promise<Evenement> {
    const backendPayload = {
        ...(data.ville !== undefined && { city: data.ville }),
        ...(data.zip_code !== undefined && { zip_code: data.zip_code }),
        ...(data.adresse !== undefined && { address: data.adresse }),
        // Convertir datetime-local en ISO complet si présent
        ...(data.date !== undefined && {
            // Convertir en ISO microseconds (Laravel Y-m-d\TH:i:s.u\Z)
            date: new Date(data.date)
                .toISOString()
                .replace(/\.(\d{3})Z$/, ".$1000Z"),
        }),
    };
    const res = await apiFetch(apiUrl(`/events/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendPayload),
    });
    if (!res.ok) {
        const errBody = await safeParseJson<{ message?: string }>(res, {});
        throw new Error(
            errBody.message ?? "Erreur lors de la mise à jour de l'événement",
        );
    }
    const raw = await safeParseJson<Record<string, unknown>>(res, {});
    return mapBackendToEvenement(raw);
}

async function deleteEvenement(id: number): Promise<void> {
    const res = await apiFetch(apiUrl(`/events/${id}`), { method: "DELETE" });
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
