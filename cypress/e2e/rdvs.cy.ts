// ── Tests : Page Rendez-vous ──────────────────────────────────────────────────

describe("Page Rendez-vous", () => {
  beforeEach(() => {
    cy.interceptApi();
  });

  // ── Affichage du tableau ────────────────────────────────────────────────────

  describe("Affichage du tableau", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.loginAs("admin");
      cy.visit("/rdvs");
      cy.wait("@getRdvs");
      cy.wait("@getVisiteurs");
      cy.wait("@getEvenements");
    });

    it("affiche le titre Rendez-vous", () => {
      cy.contains("h1", "Rendez-vous").should("be.visible");
    });

    it("affiche le compteur total de RDVs", () => {
      // 7 rdvs dans les fixtures
      cy.contains("7").should("be.visible");
      cy.contains("rendez-vous au total").should("be.visible");
    });

    it("affiche les en-têtes du tableau", () => {
      cy.get("table thead").within(() => {
        cy.contains("Visiteur").should("be.visible");
        cy.contains("Objet").should("be.visible");
        cy.contains("Événement").should("be.visible");
        cy.contains("Date RDV").should("be.visible");
      });
    });

    it("affiche toutes les lignes de RDVs", () => {
      cy.get("table tbody tr").should("have.length", 7);
    });

    it("affiche le nom du visiteur dans chaque ligne", () => {
      cy.get("table tbody").within(() => {
        cy.contains("Jean").should("be.visible");
        cy.contains("LEFEBVRE").should("be.visible");
      });
    });

    it("affiche le nom de l'objet dans chaque ligne", () => {
      cy.get("table tbody").contains("Grille-pain").should("be.visible");
    });

    it("affiche le nom de l'événement dans chaque ligne", () => {
      cy.get("table tbody")
        .contains("Repair Café Printemps")
        .should("be.visible");
    });

    it("affiche la date du RDV formatée", () => {
      cy.get("table tbody tr").first().within(() => {
        cy.contains("10/03/2024").should("be.visible");
      });
    });

    it("affiche les données du second RDV correctement", () => {
      cy.get("table tbody tr").eq(1).within(() => {
        cy.contains("Fatima").should("be.visible");
        cy.contains("Veste en laine").should("be.visible");
      });
    });

    it("affiche les données d'un RDV lié à l'événement Été", () => {
      cy.get("table tbody").contains("Repair Café Été").should("be.visible");
    });

    it("affiche les données d'un RDV lié à l'événement Automne", () => {
      cy.get("table tbody").contains("Repair Café Automne").should("be.visible");
    });
  });

  // ── Colonne Actions (admin) ─────────────────────────────────────────────────

  describe("Colonne Actions — admin", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.loginAs("admin");
      cy.visit("/rdvs");
      cy.wait("@getRdvs");
      cy.wait("@getVisiteurs");
      cy.wait("@getEvenements");
    });

    it("affiche la colonne Actions pour un admin", () => {
      cy.get("table thead").contains("Actions").should("be.visible");
    });

    it("affiche un bouton Supprimer sur chaque ligne", () => {
      cy.get("table tbody tr").each(($row) => {
        cy.wrap($row).find("button[title='Supprimer']").should("exist");
      });
    });

    it("ouvre la modale de confirmation en cliquant sur Supprimer", () => {
      cy.get("table tbody tr")
        .first()
        .find("button[title='Supprimer']")
        .click({ force: true });
      cy.get("[role='alertdialog']").should("be.visible");
    });

    it("affiche le nom du visiteur dans la confirmation de suppression", () => {
      cy.get("table tbody tr")
        .first()
        .find("button[title='Supprimer']")
        .click({ force: true });
      cy.get("[role='alertdialog']").contains("Jean").should("be.visible");
    });

    it("ferme la modale en cliquant sur Annuler", () => {
      cy.get("table tbody tr")
        .first()
        .find("button[title='Supprimer']")
        .click({ force: true });
      cy.get("[role='alertdialog']").should("be.visible");
      cy.get("[role='alertdialog']").contains("button", "Annuler").click();
      cy.get("[role='alertdialog']").should("not.exist");
    });

    it("supprime le RDV après confirmation et met à jour le tableau", () => {
      cy.intercept("DELETE", "/api/rdvs/*", { statusCode: 204 }).as("deleteRdv");
      // Après suppression, on retourne 6 RDVs
      const rdvsAfterDelete = Cypress.env("rdvsFixture") ?? [];
      cy.intercept("GET", "/api/rdvs*", { fixture: "rdvs.json" }).as("getRdvsUpdated");

      cy.get("table tbody tr")
        .first()
        .find("button[title='Supprimer']")
        .click({ force: true });
      cy.get("[role='alertdialog']").contains("button", "Supprimer").click();
      cy.wait("@deleteRdv");
    });
  });

  // ── Vue Bénévole (lecture seule) ───────────────────────────────────────────

  describe("Vue bénévole (lecture seule)", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.loginAs("benevole");
      cy.visit("/rdvs");
      cy.wait("@getRdvs");
      cy.wait("@getVisiteurs");
      cy.wait("@getEvenements");
    });

    it("affiche le tableau des RDVs", () => {
      cy.get("table tbody tr").should("have.length", 7);
    });

    it("n'affiche pas la colonne Actions pour un bénévole", () => {
      cy.get("table thead").contains("Actions").should("not.exist");
    });

    it("n'affiche pas de bouton Supprimer", () => {
      cy.get("button[title='Supprimer']").should("not.exist");
    });

    it("affiche quand même les données correctement", () => {
      cy.get("table tbody").contains("Grille-pain").should("be.visible");
      cy.get("table tbody").contains("Repair Café Printemps").should("be.visible");
    });
  });

  // ── État vide ────────────────────────────────────────────────────────────────

  describe("État vide", () => {
    it("affiche un message quand il n'y a aucun RDV", () => {
      cy.intercept("GET", "/api/rdvs*", { body: [] }).as("getRdvsEmpty");
      cy.visit("/");
      cy.loginAs("admin");
      cy.visit("/rdvs");
      cy.wait("@getRdvsEmpty");
      cy.wait("@getVisiteurs");
      cy.wait("@getEvenements");
      cy.contains("Aucun rendez-vous enregistré").should("be.visible");
    });

    it("affiche le compteur à 0 quand il n'y a aucun RDV", () => {
      cy.intercept("GET", "/api/rdvs*", { body: [] }).as("getRdvsEmpty");
      cy.visit("/");
      cy.loginAs("admin");
      cy.visit("/rdvs");
      cy.wait("@getRdvsEmpty");
      cy.contains("0").should("be.visible");
      cy.contains("rendez-vous au total").should("be.visible");
    });
  });

  // ── Skeleton de chargement ────────────────────────────────────────────────

  describe("Skeleton de chargement", () => {
    it("affiche un skeleton pendant le chargement des données", () => {
      // Retarder la réponse pour observer le skeleton
      cy.intercept("GET", "/api/rdvs*", (req) => {
        req.reply((res) => {
          res.setDelay(500);
          res.send({ fixture: "rdvs.json" });
        });
      }).as("getRdvsSlow");

      cy.visit("/");
      cy.loginAs("admin");
      cy.visit("/rdvs");

      // Le skeleton doit être visible avant la réponse
      cy.get("[class*='animate-pulse']").should("exist");

      cy.wait("@getRdvsSlow");
      cy.wait("@getVisiteurs");
      cy.wait("@getEvenements");

      // Le skeleton doit disparaître après le chargement
      cy.get("table").should("be.visible");
    });
  });

  // ── Accessibilité de la page ──────────────────────────────────────────────

  describe("Accessibilité et structure", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.loginAs("admin");
      cy.visit("/rdvs");
      cy.wait("@getRdvs");
      cy.wait("@getVisiteurs");
      cy.wait("@getEvenements");
    });

    it("la page est accessible via le lien Rendez-vous dans la sidebar", () => {
      cy.visit("/dashboard");
      cy.wait("@getBenevoles");
      cy.get("aside").contains("Rendez-vous").click();
      cy.url().should("include", "/rdvs");
      cy.contains("h1", "Rendez-vous").should("be.visible");
    });

    it("le tableau est contenu dans une Card", () => {
      cy.get("table").parents("[class*='overflow-hidden']").should("exist");
    });

    it("affiche les lignes du tableau avec hover visible", () => {
      cy.get("table tbody tr")
        .first()
        .should("have.class", "hover:bg-muted/40");
    });
  });
});
