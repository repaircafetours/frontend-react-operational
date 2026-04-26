import type { Role } from "./user";

// ── Enums / union types ───────────────────────────────────────────────────────

export type CategorieBenevole = "reparateur" | "operationnel" | "intendant";

export type SecteurReparation =
    | "Électronique"
    | "Électroménager"
    | "Vêtements & Textile"
    | "Informatique"
    | "Mobilier"
    | "Bijoux & Accessoires"
    | "Jouets"
    | "Autre";

export type RegimeAlimentaire =
    | "Omnivore"
    | "Végétarien"
    | "Végétalien"
    | "Sans gluten"
    | "Sans lactose"
    | "Halal"
    | "Casher";

// ── Constants ─────────────────────────────────────────────────────────────────

export const CATEGORIES_BENEVOLE: Record<CategorieBenevole, string> = {
    reparateur: "Réparateur",
    operationnel: "Opérationnel",
    intendant: "Intendant",
};

export const SECTEURS_REPARATION: SecteurReparation[] = [
    "Électronique",
    "Électroménager",
    "Vêtements & Textile",
    "Informatique",
    "Mobilier",
    "Bijoux & Accessoires",
    "Jouets",
    "Autre",
];

export const REGIMES_ALIMENTAIRES: RegimeAlimentaire[] = [
    "Omnivore",
    "Végétarien",
    "Végétalien",
    "Sans gluten",
    "Sans lactose",
    "Halal",
    "Casher",
];

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface Benevole {
    id: number;
    idHumHub?: number;
    nom: string;
    prenom: string;
    photo?: string;
    /** Role determines app access level */
    role: Role;
    /** Categorie describes their function at the event */
    categorie: CategorieBenevole;
    /** Repair specialties – relevant for reparateurs */
    secteurs: SecteurReparation[];
    regimeAlimentaire: RegimeAlimentaire;
    actif: boolean;
    createdAt: string;
}

export interface BenevoleFormData {
    nom: string;
    prenom: string;
    photo?: string;
    role: Role;
    categorie: CategorieBenevole;
    secteurs: SecteurReparation[];
    regimeAlimentaire: RegimeAlimentaire;
    actif: boolean;
}

export interface BenevoleCreateData {
    idHumHub: number;
    password: string;
}
