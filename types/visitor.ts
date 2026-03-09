import { Objet } from "./objet";

export interface Visiteur {
  id: number;
  nom: string;
  billet: string;
  evenement: string;
  objets: Objet[];
  createdAt: string;
}

// -- Form Data --

export interface VisiteurFormData {
  nom: string;
  billet: string;
  evenement: string;
}