// ── Cypress Custom Commands ───────────────────────────────────────────────────

import type { Role } from "../../types/user";

// ── Types ─────────────────────────────────────────────────────────────────────

interface UserSession {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
}

const PROFILES: Record<Role, UserSession> = {
  admin: {
    id: 1,
    nom: "Martin",
    prenom: "Sophie",
    email: "sophie@repaircafe.fr",
    role: "admin",
  },
  benevole: {
    id: 2,
    nom: "Dupont",
    prenom: "Luc",
    email: "luc@repaircafe.fr",
    role: "benevole",
  },
  benevole_intendant: {
    id: 5,
    nom: "Leroy",
    prenom: "Camille",
    email: "camille@repaircafe.fr",
    role: "benevole_intendant",
  },
};

// ── loginAs ───────────────────────────────────────────────────────────────────
// Injecte la session utilisateur dans le localStorage (zustand persist)
// avant que la page ne soit chargée, simulant une connexion sans passer
// par l'interface de login.

Cypress.Commands.add("loginAs", (role: Role) => {
  const user = PROFILES[role];
  const storageValue = JSON.stringify({
    state: { user },
    version: 0,
  });
  cy.window().then((win) => {
    win.localStorage.setItem("repaircafe-auth", storageValue);
  });
});

// ── interceptApi ─────────────────────────────────────────────────────────────
// Intercepte tous les appels API courants et les sert depuis les fixtures
// locales, pour des tests déterministes et indépendants du serveur.

Cypress.Commands.add("interceptApi", () => {
  cy.intercept("GET", "/api/benevoles", { fixture: "benevoles.json" }).as(
    "getBenevoles",
  );
  cy.intercept("GET", "/api/visiteurs", { fixture: "visiteurs.json" }).as(
    "getVisiteurs",
  );
  cy.intercept("GET", "/api/evenements", { fixture: "evenements.json" }).as(
    "getEvenements",
  );
  cy.intercept("GET", "/api/rdvs*", { fixture: "rdvs.json" }).as("getRdvs");
});

// ── TypeScript declarations ───────────────────────────────────────────────────

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Connecte l'utilisateur en injectant la session dans le localStorage.
       * @example cy.loginAs('admin')
       */
      loginAs(role: Role): Chainable<void>;

      /**
       * Intercepte tous les appels API et les remplace par les fixtures.
       * @example cy.interceptApi()
       */
      interceptApi(): Chainable<void>;
    }
  }
}
