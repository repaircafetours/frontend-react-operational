export type Role = "benevole" | "admin";

export interface UserSession {
  id: number;
  nom: string;
  email: string;
  role: Role;
}