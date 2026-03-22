export type Role = "admin" | "benevole" | "benevole_intendant";

export interface UserSession {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: Role;
}
