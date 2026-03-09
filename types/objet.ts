export type TypeObjet = "Sac" | "Vêtement" | "Bijou" | "Électronique" | "Autre";

export interface Objet {
  id: number;
  type: TypeObjet;
  description: string;
  restitue: boolean;
  createdAt: string;
}

// -- Form Data --

export interface ObjetFormData {
  type: TypeObjet;
  description: string;
}