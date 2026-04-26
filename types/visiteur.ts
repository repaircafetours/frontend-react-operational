import type { ObjetAReparer } from "./objet";

// ── Enums / union types ───────────────────────────────────────────────────────

export type Civilite = "M." | "Mme" | "Mx";

export type SourceConnaissance =
    | "Bouche à oreille"
    | "Réseaux sociaux"
    | "Affiche"
    | "Presse"
    | "Autre";

// ── Constants ─────────────────────────────────────────────────────────────────

export const CIVILITES: Civilite[] = ["M.", "Mme", "Mx"];

export const SOURCES_CONNAISSANCE: SourceConnaissance[] = [
    "Bouche à oreille",
    "Réseaux sociaux",
    "Affiche",
    "Presse",
    "Autre",
];

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Visiteur {
    id: number;
    prenom: string;
    nom: string;
    civilite: Civilite;
    email: string;
    telephone: string;
    objets: ObjetAReparer[];
    /** How the visitor heard about the association */
    connu: SourceConnaissance;
    zip_code?: string;
    city?: string;
    notification?: boolean;
    createdAt: string;
}

export interface VisiteurFormData {
    prenom: string;
    nom: string;
    civilite: Civilite;
    email: string;
    telephone: string;
    connu: SourceConnaissance;
    zip_code?: string;
    city?: string;
    notification?: boolean;
}

export interface VisiteurUpdateData {
    prenom?: string;
    nom?: string;
    civilite?: Civilite;
    email?: string;
    telephone?: string;
    connu?: SourceConnaissance;
    zip_code?: string;
    city?: string;
    notification?: boolean;
}
