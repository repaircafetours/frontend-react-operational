import { Role } from "./user";

export interface Benevole {
  id: number;
  nom: string;
  email: string;
  role: Role;
  disponibilite: string;
  createdAt: string;
}

// -- Form Data --

export interface BenevoleFormData {
  nom: string;
  email: string;
  role: Role;
  disponibilite: string;
}
