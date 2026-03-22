// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Evenement {
    id: number;
    nom: string;
    ville: string;
    lieu: string;
    date: string; // ISO 8601 date string
    adresse: string;
    createdAt: string;
}

export interface EvenementFormData {
    nom: string;
    ville: string;
    lieu: string;
    date: string;
    adresse: string;
}

export interface EvenementUpdateData {
    nom?: string;
    ville?: string;
    lieu?: string;
    date?: string;
    adresse?: string;
}
