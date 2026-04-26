import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    Benevole,
    BenevoleFormData,
    BenevoleCreateData,
} from "@/types/benevole";
import { apiUrl } from "@/lib/config";
import { apiFetch, safeParseJson } from "@/lib/api";

// ── Mapping backend → Benevole ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBenevole(raw: any): Benevole {
    return {
        id: raw.id,
        idHumHub: raw.idHumHub ?? raw.id_humhub ?? undefined,
        nom: raw.nom ?? raw.name ?? raw.last_name ?? `Bénévole #${raw.id}`,
        prenom: raw.prenom ?? raw.firstname ?? raw.first_name ?? "",
        photo: raw.photo ?? undefined,
        role: raw.role ?? "benevole",
        categorie: raw.categorie ?? raw.category ?? "operationnel",
        secteurs: raw.secteurs ?? raw.sectors ?? [],
        regimeAlimentaire: raw.regimeAlimentaire ?? raw.diet ?? "Omnivore",
        actif: raw.actif ?? raw.active ?? true,
        createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    };
}

// ── Query keys ────────────────────────────────────────────────────────────────

export const benevoleKeys = {
    all: ["benevoles"] as const,
    list: () => [...benevoleKeys.all, "list"] as const,
    detail: (id: number) => [...benevoleKeys.all, "detail", id] as const,
};

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchBenevoles(): Promise<Benevole[]> {
    const res = await apiFetch(apiUrl("/volunteers"));
    
    if (!res.ok) throw new Error("Erreur lors du chargement des bénévoles");
    const data = await safeParseJson<unknown[]>(res, []);
    const list = Array.isArray(data) ? data : [];
    return list.map(mapBenevole);
}

async function fetchBenevole(id: number): Promise<Benevole> {
    const res = await apiFetch(apiUrl(`/volunteers/${id}`));
    if (!res.ok) throw new Error("Bénévole introuvable");
    const data = await safeParseJson<Record<string, unknown>>(res, {});
    return mapBenevole(data);
}

async function createBenevole(data: BenevoleCreateData): Promise<Benevole> {
    const res = await apiFetch(apiUrl("/volunteers"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errBody = await safeParseJson<{ message?: string }>(res, {});
        throw new Error(
            errBody.message ?? "Erreur lors de la création du bénévole",
        );
    }
    const raw = await safeParseJson<Record<string, unknown>>(res, {});
    return mapBenevole(raw);
}

async function updateBenevole({
    id,
    data,
}: {
    id: number;
    data: Partial<BenevoleFormData>;
}): Promise<Benevole> {
    const res = await apiFetch(apiUrl(`/volunteers/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errBody = await safeParseJson<{ message?: string }>(res, {});
        throw new Error(
            errBody.message ?? "Erreur lors de la mise à jour du bénévole",
        );
    }
    const raw = await safeParseJson<Record<string, unknown>>(res, {});
    return mapBenevole(raw);
}

async function deleteBenevole(id: number): Promise<void> {
    const res = await apiFetch(apiUrl(`/volunteers/${id}`), {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Erreur lors de la suppression du bénévole");
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useBenevoles() {
    return useQuery<Benevole[], Error>({
        queryKey: benevoleKeys.list(),
        queryFn: fetchBenevoles,
    });
}

export function useBenevole(id: number) {
    return useQuery<Benevole, Error>({
        queryKey: benevoleKeys.detail(id),
        queryFn: () => fetchBenevole(id),
        enabled: id > 0,
    });
}

export function useCreateBenevole() {
    const qc = useQueryClient();
    return useMutation<Benevole, Error, BenevoleCreateData>({
        mutationFn: createBenevole,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: benevoleKeys.list() }),
    });
}

export function useUpdateBenevole() {
    const qc = useQueryClient();
    return useMutation<
        Benevole,
        Error,
        { id: number; data: Partial<BenevoleFormData> }
    >({
        mutationFn: updateBenevole,
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({
                queryKey: benevoleKeys.detail(variables.id),
            });
            qc.invalidateQueries({ queryKey: benevoleKeys.list() });
        },
    });
}

export function useDeleteBenevole() {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: deleteBenevole,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: benevoleKeys.list() }),
    });
}
