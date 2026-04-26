import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiUrl } from "@/lib/config";
import { apiFetch, safeParseJson } from "@/lib/api";
import type {
    Visiteur,
    VisiteurFormData,
    VisiteurUpdateData,
    SourceConnaissance,
} from "@/types/visiteur";
import type {
    ObjetAReparer,
    ObjetFormData,
    ObjetUpdateData,
    StatutObjet,
} from "@/types/objet";

// ── Query keys ────────────────────────────────────────────────────────────────

export const visiteurKeys = {
    all: ["visiteurs"] as const,
    list: () => [...visiteurKeys.all, "list"] as const,
    detail: (id: number) => [...visiteurKeys.all, "detail", id] as const,
};

// ── Mapping helpers ───────────────────────────────────────────────────────────

// ── Normalisation des valeurs backend ↔ frontend ─────────────────────────────

const BACKEND_SOURCE_MAP: Record<string, SourceConnaissance> = {
    "bouche a oreille": "Bouche à oreille",
    "bouche à oreille": "Bouche à oreille",
    "reseaux sociaux": "Réseaux sociaux",
    "réseaux sociaux": "Réseaux sociaux",
    affiche: "Affiche",
    presse: "Presse",
    autre: "Autre",
};

const VALID_SOURCES: SourceConnaissance[] = [
    "Bouche à oreille",
    "Réseaux sociaux",
    "Affiche",
    "Presse",
    "Autre",
];

function normalizeSource(raw: unknown): SourceConnaissance {
    if (!raw) return "Autre";
    const str = String(raw).trim();
    if (VALID_SOURCES.includes(str as SourceConnaissance))
        return str as SourceConnaissance;
    return BACKEND_SOURCE_MAP[str.toLowerCase()] ?? "Autre";
}

const FRONTEND_TO_BACKEND_SOURCE: Record<SourceConnaissance, string> = {
    "Bouche à oreille": "bouche a oreille",
    "Réseaux sociaux": "réseaux sociaux",
    Affiche: "affiche",
    Presse: "presse",
    Autre: "autre",
};

function normalizeCivilite(raw: unknown): "M." | "Mme" {
    const str = String(raw ?? "")
        .toLowerCase()
        .trim();
    if (str === "femme" || str === "mme" || str === "f") return "Mme";
    return "M.";
}

function toBackendVisiteur(data: VisiteurFormData | VisiteurUpdateData) {
    return {
        // civilite → title backend
        ...(data.civilite !== undefined && {
            title: data.civilite === "Mme" ? "femme" : "homme",
        }),
        ...(data.nom !== undefined && { name: data.nom }),
        ...(data.prenom !== undefined && { surname: data.prenom }),
        ...(data.email !== undefined && { email: data.email }),
        // Supprimer les espaces/tirets du téléphone avant envoi (backend attend "0612345678")
        ...(data.telephone !== undefined && {
            phone_number: data.telephone.replace(/[\s\-\.]/g, ""),
        }),
        // Envoyer la valeur au format backend (minuscules)
        ...(data.connu !== undefined && {
            source: FRONTEND_TO_BACKEND_SOURCE[data.connu] ?? data.connu,
        }),
        // Chaînes vides → champ omis du PATCH (évite les 422)
        ...(data.zip_code ? { zip_code: data.zip_code } : {}),
        ...(data.city ? { city: data.city } : {}),
        ...(data.notification !== undefined && {
            notification: data.notification,
        }),
    };
}

function fromBackendVisiteur(
    raw: Record<string, unknown>,
    objets: ObjetAReparer[] = [],
): Visiteur {
    return {
        id: raw.id as number,
        // Normalise "femme"/"homme" (backend) → "Mme"/"M." (frontend enum)
        civilite: normalizeCivilite(raw.title),
        // Essaie plusieurs noms de champs possibles
        nom: (raw.name ?? raw.nom ?? raw.last_name ?? "") as string,
        prenom: (raw.surname ?? raw.prenom ?? raw.first_name ?? "") as string,
        email: (raw.email ?? "") as string,
        telephone: (raw.phone_number ?? raw.telephone ?? "") as string,
        // Normalise la source backend vers les valeurs enum frontend exactes
        connu: normalizeSource(raw.source ?? raw.connu),
        zip_code: (raw.zip_code ?? undefined) as string | undefined,
        city: (raw.city ?? undefined) as string | undefined,
        notification: raw.notification as boolean | undefined,
        objets,
        createdAt: (raw.created_at ??
            raw.createdAt ??
            new Date().toISOString()) as string,
    };
}

function toBackendItem(data: ObjetFormData) {
    return {
        name: data.nom,
        brand: data.marque,
        weight: data.poids ?? 0,
        is_electric: data.risqueElectrique,
        age: data.age ?? 0,
    };
}

function fromBackendItem(
    raw: Record<string, unknown>,
    visiteurId?: number,
): ObjetAReparer {
    const vid =
        visiteurId ??
        (raw.visitor_id as number | undefined) ??
        (raw.visiteur_id as number | undefined) ??
        0;
    return {
        id: raw.id as number,
        visiteurId: vid,
        nom: (raw.name ?? raw.nom) as string,
        marque: (raw.brand ?? raw.marque ?? "") as string,
        description: (raw.description ?? "") as string,
        faitDisjoncter: (raw.fait_disjoncter ??
            raw.faitDisjoncter ??
            false) as boolean,
        poids: (raw.weight ?? raw.poids) as number | undefined,
        age: raw.age as number | undefined,
        note: (raw.note ?? "") as string,
        demonte: (raw.demonte ?? false) as boolean,
        risqueElectrique: (raw.is_electric ??
            raw.risqueElectrique ??
            false) as boolean,
        statut: (raw.statut ?? "en_attente") as StatutObjet,
        benevoleId: (raw.benevole_id ?? raw.benevoleId) as number | undefined,
        avisBenevole: (raw.avis_benevole ?? raw.avisBenevole ?? "") as string,
        pieceACommander: (raw.piece_a_commander ??
            raw.pieceACommander ??
            "") as string,
        createdAt: (raw.created_at ??
            raw.createdAt ??
            new Date().toISOString()) as string,
    };
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchItem(id: number): Promise<ObjetAReparer> {
    const res = await apiFetch(apiUrl(`/items/${id}`));
    if (!res.ok) throw new Error("Objet introuvable");
    const raw = await safeParseJson<Record<string, unknown>>(res, {});
    return fromBackendItem(raw);
}

async function fetchVisiteurs(): Promise<Visiteur[]> {
    const res = await apiFetch(apiUrl("/visitors"));
    if (!res.ok) throw new Error("Erreur lors du chargement des visiteurs");
    const raw = await safeParseJson<Record<string, unknown>[]>(res, []);
    return raw.map((v) => fromBackendVisiteur(v));
}

async function fetchVisiteur(id: number): Promise<Visiteur> {
    const [resVisiteur, resItems] = await Promise.all([
        apiFetch(apiUrl(`/visitors/${id}`)),
        apiFetch(apiUrl(`/visitors/${id}/items`)),
    ]);
    if (!resVisiteur.ok) throw new Error("Visiteur introuvable");
    if (!resItems.ok)
        throw new Error("Erreur lors du chargement des objets du visiteur");
    const raw = await safeParseJson<Record<string, unknown>>(resVisiteur, {});
    const rawItems = await safeParseJson<Record<string, unknown>[]>(
        resItems,
        [],
    );
    const objets = rawItems.map((item) => fromBackendItem(item, id));
    // exported hooks below
    return fromBackendVisiteur(raw, objets);
}

async function createVisiteur(data: VisiteurFormData): Promise<Visiteur> {
    const res = await apiFetch(apiUrl("/visitors"), {
        method: "POST",
        body: JSON.stringify(toBackendVisiteur(data)),
    });
    if (!res.ok) {
        const errBody = await safeParseJson<{ message?: string }>(res, {});
        throw new Error(
            errBody.message ?? "Erreur lors de la création du visiteur",
        );
    }
    const raw = await safeParseJson<Record<string, unknown>>(res, {});
    return fromBackendVisiteur(raw);
}

async function updateVisiteur({
    id,
    data,
}: {
    id: number;
    data: VisiteurUpdateData;
}): Promise<Visiteur> {
    // toBackendVisiteur construit déjà un objet sans champs undefined
    const partial = toBackendVisiteur(data);
    const res = await apiFetch(apiUrl(`/visitors/${id}`), {
        method: "PATCH",
        body: JSON.stringify(partial),
    });
    if (!res.ok) {
        const errBody = await safeParseJson<{ message?: string }>(res, {});
        throw new Error(
            errBody.message ?? "Erreur lors de la mise à jour du visiteur",
        );
    }
    const raw = await safeParseJson<Record<string, unknown>>(res, {});
    return fromBackendVisiteur(raw);
}

async function deleteVisiteur(id: number): Promise<void> {
    const res = await apiFetch(apiUrl(`/visitors/${id}`), {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Erreur lors de la suppression du visiteur");
}

async function addObjet({
    visiteurId,
    data,
}: {
    visiteurId: number;
    data: ObjetFormData;
}): Promise<ObjetAReparer> {
    const res = await apiFetch(apiUrl(`/visitors/${visiteurId}/items`), {
        method: "POST",
        body: JSON.stringify(toBackendItem(data)),
    });
    if (!res.ok) throw new Error("Erreur lors de l'ajout de l'objet");
    const raw = await safeParseJson<Record<string, unknown>>(res, {});
    return fromBackendItem(raw, visiteurId);
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
    const res = await apiFetch(apiUrl(`/items/${objetId}`), {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour de l'objet");
    const raw = await safeParseJson<Record<string, unknown>>(res, {});
    return fromBackendItem(raw, visiteurId);
}

async function deleteObjet({
    objetId,
}: {
    visiteurId: number;
    objetId: number;
}): Promise<void> {
    const res = await apiFetch(apiUrl(`/items/${objetId}`), {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Erreur lors de la suppression de l'objet");
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useItem(id: number) {
    return useQuery<ObjetAReparer, Error>({
        queryKey: ["items", "detail", id] as const,
        queryFn: () => fetchItem(id),
        enabled: id > 0,
    });
}

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
