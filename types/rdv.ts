// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Rdv {
    id: number;
    visiteurId: number;
    objetId: number;
    evenementId: number;
    createdAt: string;
}

export interface RdvFormData {
    visiteurId: number;
    objetId: number;
    evenementId: number;
}
