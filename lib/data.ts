import { Benevole } from "@/types/benevole";
import { Visiteur } from "@/types/visitor";


// Simulated in-memory DB (persists for the lifetime of the Next.js process)
export const db = {
  benevoles: [
    {
      id: 1,
      nom: "Sophie Martin",
      email: "sophie@benev.fr",
      role: "admin" as const,
      disponibilite: "Samedi",
      createdAt: "2024-01-10T08:00:00Z",
    },
    {
      id: 2,
      nom: "Luc Dupont",
      email: "luc@benev.fr",
      role: "benevole" as const,
      disponibilite: "Dimanche",
      createdAt: "2024-01-12T09:00:00Z",
    },
    {
      id: 3,
      nom: "Aria Ndiaye",
      email: "aria@benev.fr",
      role: "benevole" as const,
      disponibilite: "Samedi + Dimanche",
      createdAt: "2024-01-15T10:00:00Z",
    },
  ] as Benevole[],

  visiteurs: [
    {
      id: 1,
      nom: "Jean Lefebvre",
      billet: "VIP-001",
      evenement: "Festival des Arts",
      createdAt: "2024-03-01T08:00:00Z",
      objets: [
        {
          id: 1,
          type: "Sac" as const,
          description: "Sac à dos bleu marine",
          restitue: false,
          createdAt: "2024-03-01T10:00:00Z",
        },
        {
          id: 2,
          type: "Vêtement" as const,
          description: "Veste rouge taille M",
          restitue: true,
          createdAt: "2024-03-01T11:00:00Z",
        },
      ],
    },
    {
      id: 2,
      nom: "Fatima Oui",
      billet: "STD-042",
      evenement: "Festival des Arts",
      createdAt: "2024-03-01T09:00:00Z",
      objets: [
        {
          id: 3,
          type: "Bijou" as const,
          description: "Bracelet argenté",
          restitue: false,
          createdAt: "2024-03-01T12:00:00Z",
        },
      ],
    },
    {
      id: 3,
      nom: "Marco Rossi",
      billet: "VIP-007",
      evenement: "Salon Tech",
      createdAt: "2024-03-02T08:00:00Z",
      objets: [],
    },
  ] as Visiteur[],
};
