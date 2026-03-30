// ── Tests : Page Événements ───────────────────────────────────────────────────

describe("Page Événements", () => {
  // ── Setup commun ────────────────────────────────────────────────────────────

  const visitAsAdmin = () => {
    cy.interceptApi();
    cy.visit("/");
    cy.loginAs("admin");
    cy.visit("/evenements");
    cy.wait("@getEvenements");
    cy.wait("@getRdvs");
  };

  const visitAsBenevole = () => {
    cy.interceptApi();
    cy.visit("/");
    cy.loginAs("benevole");
    cy.visit("/evenements");
    cy.wait("@getEvenements");
    cy.wait("@getRdvs");
  };

  // ── Affichage général ────────────────────────────────────────────────────────

  describe("Affichage général", () => {
    beforeEach(visitAsAdmin);

    it("affiche le titre Événements", () => {
      cy.contains("h1", "Événements").should("be.visible");
    });

    it("affiche le nombre total d'événements", () => {
      cy.contains("4 événements au total").should("be.visible");
    });

    it("affiche la section À venir", () => {
      cy.contains("h2", "À venir").should("be.visible");
    });

    it("affiche la section Passés", () => {
      cy.contains("h2", "Passés").should("be.visible");
    });
  });

  // ── Section À venir ──────────────────────────────────────────────────────────

  describe("Section À venir", () => {
    beforeEach(visitAsAdmin);

    it("affiche l'événement futur (Repair Café Hiver)", () => {
      cy.contains("h2", "À venir")
        .parent()
        .contains("Repair Café Hiver")
        .should("be.visible");
    });

    it("affiche les en-têtes du tableau À venir", () => {
      cy.contains("h2", "À venir")
        .parent()
        .find("thead")
        .within(() => {
          cy.contains("Nom").should("be.visible");
          cy.contains("Date").should("be.visible");
          cy.contains("Lieu").should("be.visible");
          cy.contains("Ville").should("be.visible");
          cy.contains("RDV").should("be.visible");
          cy.contains("Statut").should("be.visible");
        });
    });

    it("affiche le badge À venir pour l'événement futur", () => {
      cy.contains("h2", "À venir")
        .parent()
        .contains("Repair Café Hiver")
        .parents("tr")
        .contains("À venir")
        .should("be.visible");
    });

    it("affiche la ville de l'événement futur", () => {
      cy.contains("h2", "À venir")
        .parent()
        .contains("Repair Café Hiver")
        .parents("tr")
        .contains("Dijon")
        .should("be.visible");
    });

    it("affiche le lieu de l'événement futur", () => {
      cy.contains("h2", "À venir")
        .parent()
        .contains("Repair Café Hiver")
        .parents("tr")
        .contains("Bibliothèque Universitaire")
        .should("be.visible");
    });
  });

  // ── Section Passés ───────────────────────────────────────────────────────────

  describe("Section Passés", () => {
    beforeEach(visitAsAdmin);

    it("affiche les événements passés", () => {
      cy.contains("h2", "Passés")
        .parent()
        .within(() => {
          cy.contains("Repair Café Printemps").should("be.visible");
          cy.contains("Repair Café Été").should("be.visible");
          cy.contains("Repair Café Automne").should("be.visible");
        });
    });

    it("affiche les badges Passé", () => {
      cy.contains("h2", "Passés")
        .parent()
        .find("tbody tr")
        .each(($tr) => {
          cy.wrap($tr).contains("Passé").should("be.visible");
        });
    });

    it("affiche les villes des événements passés", () => {
      cy.contains("h2", "Passés")
        .parent()
        .within(() => {
          cy.contains("Beaune").should("be.visible");
        });
    });
  });

  // ── Compteur RDV ─────────────────────────────────────────────────────────────

  describe("Compteur de RDV", () => {
    beforeEach(visitAsAdmin);

    it("affiche la colonne RDV dans le tableau", () => {
      cy.contains("h2", "Passés")
        .parent()
        .find("thead")
        .contains("RDV")
        .should("be.visible");
    });

    it("affiche 3 RDV pour Repair Café Printemps (evenementId=1)", () => {
      cy.contains("Repair Café Printemps")
        .parents("tr")
        .find("td")
        .contains("3")
        .should("be.visible");
    });

    it("affiche 3 RDV pour Repair Café Été (evenementId=2)", () => {
      cy.contains("Repair Café Été")
        .parents("tr")
        .find("td")
        .contains("3")
        .should("be.visible");
    });

    it("affiche 1 RDV pour Repair Café Automne (evenementId=3)", () => {
      cy.contains("Repair Café Automne")
        .parents("tr")
        .find("td")
        .contains("1")
        .should("be.visible");
    });

    it("affiche 0 RDV pour Repair Café Hiver (evenementId=4)", () => {
      cy.contains("Repair Café Hiver")
        .parents("tr")
        .find("td")
        .contains("0")
        .should("be.visible");
    });
  });

  // ── Navigation vers le détail ─────────────────────────────────────────────

  describe("Navigation vers le détail", () => {
    beforeEach(visitAsAdmin);

    it("navigue vers la page détail en cliquant sur une ligne passée", () => {
      cy.interceptApi();
      cy.contains("Repair Café Printemps").parents("tr").click();
      cy.url().should("include", "/evenements/1");
    });

    it("navigue vers la page détail en cliquant sur l'événement futur", () => {
      cy.interceptApi();
      cy.contains("Repair Café Hiver").parents("tr").click();
      cy.url().should("include", "/evenements/4");
    });
  });

  // ── Actions Admin ─────────────────────────────────────────────────────────

  describe("Actions administrateur", () => {
    beforeEach(visitAsAdmin);

    it("affiche le bouton Ajouter", () => {
      cy.contains("button", "Ajouter").should("be.visible");
    });

    it("ouvre la modale de création en cliquant sur Ajouter", () => {
      cy.contains("button", "Ajouter").click();
      cy.get("[role='dialog']").should("be.visible");
    });

    it("ferme la modale en cliquant sur Annuler", () => {
      cy.contains("button", "Ajouter").click();
      cy.get("[role='dialog']").should("be.visible");
      cy.get("[role='dialog']").contains("button", "Annuler").click();
      cy.get("[role='dialog']").should("not.exist");
    });

    it("affiche les boutons Modifier et Supprimer sur chaque ligne (hover)", () => {
      cy.contains("Repair Café Printemps")
        .parents("tr")
        .within(() => {
          cy.get("button[title='Modifier']").should("exist");
          cy.get("button[title='Supprimer']").should("exist");
        });
    });

    it("ouvre la modale d'édition en cliquant sur Modifier", () => {
      cy.contains("Repair Café Printemps")
        .parents("tr")
        .find("button[title='Modifier']")
        .click({ force: true });
      cy.get("[role='dialog']").should("be.visible");
    });

    it("ouvre la confirmation de suppression en cliquant sur Supprimer", () => {
      cy.contains("Repair Café Printemps")
        .parents("tr")
        .find("button[title='Supprimer']")
        .click({ force: true });
      cy.get("[role='alertdialog']").should("be.visible");
    });

    it("affiche le nom de l'événement dans la confirmation de suppression", () => {
      cy.contains("Repair Café Printemps")
        .parents("tr")
        .find("button[title='Supprimer']")
        .click({ force: true });
      cy.get("[role='alertdialog']")
        .contains("Repair Café Printemps")
        .should("be.visible");
    });

    it("ferme la confirmation de suppression en cliquant sur Annuler", () => {
      cy.contains("Repair Café Printemps")
        .parents("tr")
        .find("button[title='Supprimer']")
        .click({ force: true });
      cy.get("[role='alertdialog']").contains("button", "Annuler").click();
      cy.get("[role='alertdialog']").should("not.exist");
    });
  });

  // ── Vue Bénévole (lecture seule) ──────────────────────────────────────────

  describe("Vue bénévole (lecture seule)", () => {
    beforeEach(visitAsBenevole);

    it("n'affiche pas le bouton Ajouter", () => {
      cy.contains("button", "Ajouter").should("not.exist");
    });

    it("n'affiche pas la colonne Actions", () => {
      cy.get("table thead").contains("Actions").should("not.exist");
    });

    it("n'affiche pas les boutons Modifier et Supprimer", () => {
      cy.get("button[title='Modifier']").should("not.exist");
      cy.get("button[title='Supprimer']").should("not.exist");
    });

    it("peut quand même naviguer vers le détail d'un événement", () => {
      cy.interceptApi();
      cy.contains("Repair Café Printemps").parents("tr").click();
      cy.url().should("include", "/evenements/1");
    });
  });

  // ── État vide ────────────────────────────────────────────────────────────

  describe("État vide", () => {
    it("affiche le message Aucun événement à venir si la liste est vide", () => {
      cy.interceptApi();
      cy.intercept("GET", "/api/evenements", { body: [] }).as(
        "getEvenementsEmpty",
      );
      cy.intercept("GET", "/api/rdvs*", { body: [] }).as("getRdvsEmpty");
      cy.visit("/");
      cy.loginAs("admin");
      cy.visit("/evenements");
      cy.wait("@getEvenementsEmpty");
      cy.contains("Aucun événement à venir.").should("be.visible");
      cy.contains("Aucun événement passé.").should("be.visible");
    });
  });
});
