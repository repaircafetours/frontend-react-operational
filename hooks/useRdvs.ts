import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Rdv, RdvFormData } from "@/types/rdv";
import { apiUrl } from "@/lib/config";
import { apiFetch, safeParseJson } from "@/lib/api";

// ── Query keys ────────────────────────────────────────────────────────────────

export const rdvKeys = {
    all: ["rdvs"] as const,
    list: (filters?: { evenementId?: number; visiteurId?: number }) =>
        [...rdvKeys.all, "list", filters ?? {}] as const,
};

// ── Mapping helpers ───────────────────────────────────────────────────────────

function fromBackendAppointment(
    raw: Record<string, unknown>,
    evenementId: number,
): Rdv {
    return {
        id: raw.id as number,
        visiteurId: (raw.visitor_id ?? raw.visiteurId) as number | undefined,
        objetId: (raw.item_id ?? raw.objetId) as number,
        evenementId: (raw.event_id ?? evenementId) as number,
        date: raw.date as string | undefined,
        comment: raw.comment as string | undefined,
        createdAt: (raw.created_at ??
            raw.createdAt ??
            new Date().toISOString()) as string,
    };
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchRdvs(filters?: {
    evenementId?: number;
    visiteurId?: number;
}): Promise<Rdv[]> {
    if (filters?.evenementId !== undefined) {
        const res = await apiFetch(
            apiUrl(`/events/${filters.evenementId}/appointments`),
        );
        if (!res.ok)
            throw new Error("Erreur lors du chargement des rendez-vous");
        const raw = await safeParseJson<Record<string, unknown>[]>(res, []);
        return raw.map((a) =>
            fromBackendAppointment(a, filters.evenementId as number),
        );
    }

    // Pas de filtre : récupérer tous les événements puis leurs rendez-vous
    const resEvents = await apiFetch(apiUrl("/events"));
    if (!resEvents.ok)
        throw new Error("Erreur lors du chargement des événements");
    const events = await safeParseJson<{ id: number }[]>(resEvents, []);

    const allAppointments = await Promise.all(
        events.map(async (event) => {
            const res = await apiFetch(
                apiUrl(`/events/${event.id}/appointments`),
            );
            if (!res.ok) return [];
            const raw = await safeParseJson<Record<string, unknown>[]>(res, []);
            return raw.map((a) => fromBackendAppointment(a, event.id));
        }),
    );

    return allAppointments.flat();
}

async function createRdv(data: RdvFormData): Promise<Rdv> {
    const res = await apiFetch(
        apiUrl(`/events/${data.evenementId}/appointments/${data.objetId}`),
        {
            method: "POST",
            body: JSON.stringify({ date: data.date }),
        },
    );
    if (!res.ok) throw new Error("Erreur lors de la création du rendez-vous");
    const raw = await safeParseJson<Record<string, unknown>>(res, {});
    return fromBackendAppointment(raw, data.evenementId);
}

async function deleteRdv(rdv: {
    id: number;
    evenementId: number;
}): Promise<void> {
    const res = await apiFetch(
        apiUrl(`/events/${rdv.evenementId}/appointments/${rdv.id}`),
        { method: "DELETE" },
    );
    if (!res.ok)
        throw new Error("Erreur lors de la suppression du rendez-vous");
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
        onSuccess: () => qc.invalidateQueries({ queryKey: rdvKeys.all }),
    });
}

export function useDeleteRdv() {
    const qc = useQueryClient();
    return useMutation<void, Error, { id: number; evenementId: number }>({
        mutationFn: deleteRdv,
        onSuccess: () => qc.invalidateQueries({ queryKey: rdvKeys.all }),
    });
}
