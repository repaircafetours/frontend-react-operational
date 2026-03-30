// ── Tests : Navigation sidebar ────────────────────────────────────────────────

describe("Navigation sidebar", () => {
  beforeEach(() => {
    cy.interceptApi();
  });

  // ── Admin ──────────────────────────────────────────────────────────────────

  describe("En tant qu'admin", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.loginAs("admin");
      cy.visit("/dashboard");
      cy.wait("@getBenevoles");
      cy.wait("@getVisiteurs");
      cy.wait("@getEvenements");
    });

    it("affiche tous les éléments de navigation", () => {
      cy.get("aside").within(() => {
        cy.contains("Dashboard").should("be.visible");
        cy.contains("Bénévoles").should("be.visible");
        cy.contains("Visiteurs").should("be.visible");
        cy.contains("Événements").should("be.visible");
        cy.contains("Rendez-vous").should("be.visible");
      });
    });

    it("affiche le logo RepairCafé", () => {
      cy.get("aside").within(() => {
        cy.contains("Repair").should("be.visible");
        cy.contains("Café").should("be.visible");
      });
    });

    it("affiche le nom de l'utilisateur connecté", () => {
      cy.get("aside").within(() => {
        cy.contains("Sophie").should("be.visible");
        cy.contains("MARTIN").should("be.visible");
      });
    });

    it("affiche le badge Admin", () => {
      cy.get("aside").contains("Admin").should("be.visible");
    });

    it("met en surbrillance le lien actif — Dashboard", () => {
      cy.get("aside").contains("Dashboard").should("have.class", "text-primary");
    });

    it("navigue vers la page Bénévoles", () => {
      cy.get("aside").contains("Bénévoles").click();
      cy.url().should("include", "/benevoles");
      cy.get("aside").contains("Bénévoles").should("have.class", "text-primary");
    });

    it("navigue vers la page Visiteurs", () => {
      cy.get("aside").contains("Visiteurs").click();
      cy.url().should("include", "/visiteurs");
    });

    it("navigue vers la page Événements", () => {
      cy.get("aside").contains("Événements").click();
      cy.url().should("include", "/evenements");
    });

    it("navigue vers la page Rendez-vous", () => {
      cy.get("aside").contains("Rendez-vous").click();
      cy.url().should("include", "/rdvs");
    });

    it("affiche le bouton de déconnexion", () => {
      cy.get("aside").contains("Déconnexion").should("be.visible");
    });

    it("se déconnecte et redirige vers la page de login", () => {
      cy.get("aside").contains("Déconnexion").click();
      cy.url().should("eq", Cypress.config("baseUrl") + "/");
      cy.contains("Choisissez votre profil").should("be.visible");
    });

    it("affiche le badge Mode administrateur", () => {
      cy.get("aside").contains("Mode administrateur").should("be.visible");
    });
  });

  // ── Bénévole ───────────────────────────────────────────────────────────────

  describe("En tant que bénévole", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.loginAs("benevole");
      cy.visit("/dashboard");
      cy.wait("@getBenevoles");
      cy.wait("@getVisiteurs");
      cy.wait("@getEvenements");
    });

    it("affiche tous les éléments de navigation (hors admin)", () => {
      cy.get("aside").within(() => {
        cy.contains("Dashboard").should("be.visible");
        cy.contains("Bénévoles").should("be.visible");
        cy.contains("Visiteurs").should("be.visible");
        cy.contains("Événements").should("be.visible");
        cy.contains("Rendez-vous").should("be.visible");
      });
    });

    it("n'affiche pas le badge Mode administrateur", () => {
      cy.get("aside").contains("Mode administrateur").should("not.exist");
    });

    it("affiche le badge Bénévole", () => {
      cy.get("aside").contains("Bénévole").should("be.visible");
    });

    it("affiche le nom du bénévole connecté", () => {
      cy.get("aside").within(() => {
        cy.contains("Luc").should("be.visible");
        cy.contains("DUPONT").should("be.visible");
      });
    });
  });

  // ── Intendant ──────────────────────────────────────────────────────────────

  describe("En tant qu'intendant", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.loginAs("benevole_intendant");
      cy.visit("/intendance");
      cy.wait("@getBenevoles");
    });

    it("n'affiche que le lien Intendance", () => {
      cy.get("aside").within(() => {
        cy.contains("Intendance").should("be.visible");
        cy.contains("Dashboard").should("not.exist");
        cy.contains("Bénévoles").should("not.exist");
        cy.contains("Visiteurs").should("not.exist");
        cy.contains("Événements").should("not.exist");
        cy.contains("Rendez-vous").should("not.exist");
      });
    });

    it("affiche le badge Intendant", () => {
      cy.get("aside").contains("Intendant").should("be.visible");
    });

    it("redirige vers /intendance si l'intendant tente d'accéder à /dashboard", () => {
      cy.visit("/dashboard");
      cy.url().should("include", "/intendance");
    });
  });

  // ── Accès non connecté ─────────────────────────────────────────────────────

  describe("Sans session", () => {
    it("redirige vers la page de login si non connecté", () => {
      cy.clearLocalStorage();
      cy.visit("/dashboard");
      cy.url().should("eq", Cypress.config("baseUrl") + "/");
    });
  });
});
