// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Rdv {
    id: number;
    visiteurId?: number; // optionnel — le backend ne le renvoie pas directement
    objetId: number; // backend: item_id
    evenementId: number; // backend: event_id
    date?: string; // date du rendez-vous
    comment?: string; // commentaire bénévole
    createdAt?: string;
}

export interface RdvFormData {
    evenementId: number;
    objetId: number; // sera mis dans l'URL backend
    date: string; // date du rendez-vous (ISO)
}
