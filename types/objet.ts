// ── Enums / union types ───────────────────────────────────────────────────────

export type StatutObjet =
    | "en_attente"
    | "en_cours"
    | "repare"
    | "irreparable"
    | "a_rappeler";

// ── Constants ─────────────────────────────────────────────────────────────────

export const STATUTS_OBJET: Record<
    StatutObjet,
    { label: string; color: string }
> = {
    en_attente: {
        label: "En attente",
        color: "bg-slate-100 text-slate-700",
    },
    en_cours: {
        label: "En cours",
        color: "bg-amber-100 text-amber-700",
    },
    repare: {
        label: "Réparé",
        color: "bg-emerald-100 text-emerald-700",
    },
    irreparable: {
        label: "Irréparable",
        color: "bg-red-100 text-red-700",
    },
    a_rappeler: {
        label: "À rappeler",
        color: "bg-violet-100 text-violet-700",
    },
};

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ObjetAReparer {
    id: number;
    visiteurId: number;
    nom: string;
    marque: string;
    description: string;
    /** Whether the object causes a circuit breaker to trip */
    faitDisjoncter: boolean;
    /** Weight in kilograms */
    poids?: number;
    note: string;
    photo?: string;
    /** Whether the object has already been disassembled */
    demonte: boolean;
    risqueElectrique: boolean;
    statut: StatutObjet;
    /** ID of the benevole who handled the repair */
    benevoleId?: number;
    avisBenevole: string;
    pieceACommander: string;
    createdAt: string;
}

export interface ObjetFormData {
    nom: string;
    marque: string;
    description: string;
    faitDisjoncter: boolean;
    poids?: number;
    note: string;
    demonte: boolean;
    risqueElectrique: boolean;
}

export interface ObjetUpdateData {
    statut?: StatutObjet;
    benevoleId?: number | null;
    avisBenevole?: string;
    pieceACommander?: string;
    note?: string;
    demonte?: boolean;
}
