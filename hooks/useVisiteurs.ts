import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiUrl } from "@/lib/config";
import type {
    Visiteur,
    VisiteurFormData,
    VisiteurUpdateData,
} from "@/types/visiteur";
import type {
    ObjetAReparer,
    ObjetFormData,
    ObjetUpdateData,
} from "@/types/objet";

// ── Query keys ────────────────────────────────────────────────────────────────

export const visiteurKeys = {
    all: ["visiteurs"] as const,
    list: () => [...visiteurKeys.all, "list"] as const,
    detail: (id: number) => [...visiteurKeys.all, "detail", id] as const,
};

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchVisiteurs(): Promise<Visiteur[]> {
    const res = await fetch(apiUrl("/visiteurs"));
    if (!res.ok) throw new Error("Erreur lors du chargement des visiteurs");
    return res.json();
}

async function fetchVisiteur(id: number): Promise<Visiteur> {
    const res = await fetch(apiUrl(`/visiteurs/${id}`));
    if (!res.ok) throw new Error("Visiteur introuvable");
    return res.json();
}

async function createVisiteur(data: VisiteurFormData): Promise<Visiteur> {
    const res = await fetch(apiUrl("/visiteurs"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur lors de la création du visiteur");
    return res.json();
}

async function updateVisiteur({
    id,
    data,
}: {
    id: number;
    data: VisiteurUpdateData;
}): Promise<Visiteur> {
    const res = await fetch(apiUrl(`/visiteurs/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour du visiteur");
    return res.json();
}

async function deleteVisiteur(id: number): Promise<void> {
    const res = await fetch(apiUrl(`/visiteurs/${id}`), { method: "DELETE" });
    if (!res.ok) throw new Error("Erreur lors de la suppression du visiteur");
}

async function addObjet({
    visiteurId,
    data,
}: {
    visiteurId: number;
    data: ObjetFormData;
}): Promise<ObjetAReparer> {
    const res = await fetch(apiUrl(`/visiteurs/${visiteurId}/objets`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur lors de l'ajout de l'objet");
    return res.json();
}

async function updateObjet({
    visiteurId,
    objetId,
    data,
}: {
    visiteurId: number;
    objetId: number;
    data: ObjetUpdateData;
}): Promise<ObjetAReparer> {
    const res = await fetch(
        apiUrl(`/visiteurs/${visiteurId}/objets/${objetId}`),
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        },
    );
    if (!res.ok) throw new Error("Erreur lors de la mise à jour de l'objet");
    return res.json();
}

async function deleteObjet({
    visiteurId,
    objetId,
}: {
    visiteurId: number;
    objetId: number;
}): Promise<void> {
    const res = await fetch(
        apiUrl(`/visiteurs/${visiteurId}/objets/${objetId}`),
        {
            method: "DELETE",
        },
    );
    if (!res.ok) throw new Error("Erreur lors de la suppression de l'objet");
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
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: visiteurKeys.list() }),
    });
}

export function useUpdateVisiteur() {
    const qc = useQueryClient();
    return useMutation<
        Visiteur,
        Error,
        { id: number; data: VisiteurUpdateData }
    >({
        mutationFn: updateVisiteur,
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({
                queryKey: visiteurKeys.detail(variables.id),
            });
            qc.invalidateQueries({ queryKey: visiteurKeys.list() });
        },
    });
}

export function useDeleteVisiteur() {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: deleteVisiteur,
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: visiteurKeys.list() }),
    });
}

export function useAddObjet() {
    const qc = useQueryClient();
    return useMutation<
        ObjetAReparer,
        Error,
        { visiteurId: number; data: ObjetFormData }
    >({
        mutationFn: addObjet,
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({
                queryKey: visiteurKeys.detail(variables.visiteurId),
            });
            qc.invalidateQueries({ queryKey: visiteurKeys.list() });
        },
    });
}

export function useUpdateObjet() {
    const qc = useQueryClient();
    return useMutation<
        ObjetAReparer,
        Error,
        { visiteurId: number; objetId: number; data: ObjetUpdateData }
    >({
        mutationFn: updateObjet,
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({
                queryKey: visiteurKeys.detail(variables.visiteurId),
            });
        },
    });
}

export function useDeleteObjet() {
    const qc = useQueryClient();
    return useMutation<void, Error, { visiteurId: number; objetId: number }>({
        mutationFn: deleteObjet,
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({
                queryKey: visiteurKeys.detail(variables.visiteurId),
            });
            qc.invalidateQueries({ queryKey: visiteurKeys.list() });
        },
    });
}
