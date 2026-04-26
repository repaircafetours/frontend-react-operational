// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Evenement {
    id: number;
    nom: string;
    ville: string;
    lieu: string;
    date: string; // ISO 8601 date string
    adresse: string;
    zip_code?: string;
    createdAt: string;
}

export interface EvenementFormData {
    ville: string;
    adresse: string;
    date: string;
    zip_code: string;
}

export interface EvenementUpdateData {
    ville?: string;
    adresse?: string;
    date?: string;
    zip_code?: string;
}
