// ── Tests : Page Bénévoles ────────────────────────────────────────────────────

describe("Page Bénévoles", () => {
  // ── Setup commun ────────────────────────────────────────────────────────────

  const visitAsAdmin = () => {
    cy.interceptApi();
    cy.visit("/");
    cy.loginAs("admin");
    cy.visit("/benevoles");
    cy.wait("@getBenevoles");
  };

  const visitAsBenevole = () => {
    cy.interceptApi();
    cy.visit("/");
    cy.loginAs("benevole");
    cy.visit("/benevoles");
    cy.wait("@getBenevoles");
  };

  // ── Affichage du tableau ─────────────────────────────────────────────────────

  describe("Affichage du tableau", () => {
    beforeEach(visitAsAdmin);

    it("affiche le titre Bénévoles", () => {
      cy.contains("h1", "Bénévoles").should("be.visible");
    });

    it("affiche le compteur de bénévoles actifs", () => {
      // 7 actifs sur 8 dans les fixtures
      cy.contains("7 actif").should("be.visible");
    });

    it("affiche les en-têtes du tableau", () => {
      cy.get("table thead").within(() => {
        cy.contains("Bénévole").should("be.visible");
        cy.contains("Catégorie").should("be.visible");
        cy.contains("Secteurs").should("be.visible");
        cy.contains("Statut").should("be.visible");
        cy.contains("Actions").should("be.visible");
      });
    });

    it("affiche toutes les lignes de bénévoles", () => {
      // 8 bénévoles dans les fixtures
      cy.get("table tbody tr").should("have.length", 8);
    });

    it("affiche le prénom et le nom en majuscule dans chaque ligne", () => {
      cy.get("table tbody").within(() => {
        cy.contains("Sophie").should("be.visible");
        cy.contains("MARTIN").should("be.visible");
        cy.contains("Luc").should("be.visible");
        cy.contains("DUPONT").should("be.visible");
      });
    });

    it("affiche les avatars d'initiales", () => {
      // SM pour Sophie Martin
      cy.get("table tbody").contains("SM").should("be.visible");
      // LD pour Luc Dupont
      cy.get("table tbody").contains("LD").should("be.visible");
    });

    it("affiche les badges de catégorie", () => {
      cy.get("table tbody").within(() => {
        cy.contains("Réparateur").should("be.visible");
        cy.contains("Opérationnel").should("be.visible");
        cy.contains("Intendant").should("be.visible");
      });
    });

    it("affiche les badges Actif et Inactif", () => {
      cy.get("table tbody").within(() => {
        cy.contains("Actif").should("be.visible");
        cy.contains("Inactif").should("be.visible");
      });
    });

    it("affiche les secteurs des réparateurs", () => {
      cy.get("table tbody").within(() => {
        cy.contains("Électronique").should("be.visible");
        cy.contains("Informatique").should("be.visible");
      });
    });

    it("affiche — pour les non-réparateurs dans la colonne Secteurs", () => {
      // Sophie Martin est opérationnel → pas de secteurs → tiret
      cy.get("table tbody tr")
        .first()
        .find("td")
        .eq(2)
        .should("contain", "—");
    });
  });

  // ── Filtres par catégorie ────────────────────────────────────────────────────

  describe("Filtres par catégorie", () => {
    beforeEach(visitAsAdmin);

    it("affiche tous les bénévoles par défaut (filtre Tous)", () => {
      cy.get("table tbody tr").should("have.length", 8);
    });

    it("filtre uniquement les réparateurs", () => {
      cy.contains("button", "Réparateurs").click();
      // 4 réparateurs dans les fixtures (Dupont, Ndiaye, Bernard, Petit)
      cy.get("table tbody tr").should("have.length", 4);
      cy.get("table tbody").contains("Réparateur").should("be.visible");
    });

    it("filtre uniquement les opérationnels", () => {
      cy.contains("button", "Opérationnels").click();
      // 2 opérationnels (Martin, Fontaine)
      cy.get("table tbody tr").should("have.length", 2);
    });

    it("filtre uniquement les intendants", () => {
      cy.contains("button", "Intendants").click();
      // 2 intendants (Leroy, Moreau)
      cy.get("table tbody tr").should("have.length", 2);
    });

    it("revient à tous les bénévoles avec le filtre Tous", () => {
      cy.contains("button", "Réparateurs").click();
      cy.get("table tbody tr").should("have.length", 4);
      cy.contains("button", "Tous").click();
      cy.get("table tbody tr").should("have.length", 8);
    });

    it("le bouton de filtre actif a la classe bg-primary", () => {
      cy.contains("button", "Réparateurs").click();
      cy.contains("button", "Réparateurs").should(
        "have.class",
        "bg-primary",
      );
      cy.contains("button", "Tous").should("not.have.class", "bg-primary");
    });
  });

  // ── Filtre Actifs seulement ──────────────────────────────────────────────────

  describe("Filtre Actifs seulement", () => {
    beforeEach(visitAsAdmin);

    it("n'affiche que les bénévoles actifs quand la case est cochée", () => {
      cy.contains("Actifs seulement").click();
      // 7 actifs dans les fixtures
      cy.get("table tbody tr").should("have.length", 7);
      cy.get("table tbody").contains("Inactif").should("not.exist");
    });

    it("combine filtre catégorie + actifs seulement", () => {
      cy.contains("button", "Réparateurs").click();
      cy.contains("Actifs seulement").click();
      // 3 réparateurs actifs (Dupont, Ndiaye, Bernard) — Petit est inactif
      cy.get("table tbody tr").should("have.length", 3);
    });

    it("décocher le filtre restaure les bénévoles inactifs", () => {
      cy.contains("Actifs seulement").click();
      cy.get("table tbody tr").should("have.length", 7);
      cy.contains("Actifs seulement").click();
      cy.get("table tbody tr").should("have.length", 8);
    });
  });

  // ── Navigation vers le détail ────────────────────────────────────────────────

  describe("Navigation vers le détail", () => {
    beforeEach(visitAsAdmin);

    it("navigue vers la page détail en cliquant sur une ligne", () => {
      cy.get("table tbody tr").first().click();
      cy.url().should("match", /\/benevoles\/\d+/);
    });
  });

  // ── Droits admin ─────────────────────────────────────────────────────────────

  describe("Droits admin", () => {
    it("affiche le bouton Ajouter pour un admin", () => {
      visitAsAdmin();
      cy.contains("button", "Ajouter").should("be.visible");
    });

    it("n'affiche pas le bouton Ajouter pour un bénévole", () => {
      visitAsBenevole();
      cy.contains("button", "Ajouter").should("not.exist");
    });

    it("n'affiche pas la colonne Actions pour un bénévole", () => {
      visitAsBenevole();
      cy.get("table thead").contains("Actions").should("not.exist");
    });

    it("ouvre la modale d'ajout en cliquant sur Ajouter", () => {
      visitAsAdmin();
      cy.contains("button", "Ajouter").click();
      cy.get("[role='dialog']").should("be.visible");
    });
  });

  // ── Modale d'ajout ───────────────────────────────────────────────────────────

  describe("Modale d'ajout (admin)", () => {
    beforeEach(() => {
      visitAsAdmin();
      cy.contains("button", "Ajouter").click();
      cy.get("[role='dialog']").should("be.visible");
    });

    it("affiche les champs du formulaire", () => {
      cy.get("[role='dialog']").within(() => {
        cy.contains("Prénom").should("be.visible");
        cy.contains("Nom").should("be.visible");
      });
    });

    it("ferme la modale en cliquant sur Annuler", () => {
      cy.get("[role='dialog']").within(() => {
        cy.contains("button", "Annuler").click();
      });
      cy.get("[role='dialog']").should("not.exist");
    });
  });

  // ── Modale de suppression ────────────────────────────────────────────────────

  describe("Suppression (admin)", () => {
    beforeEach(visitAsAdmin);

    it("ouvre la modale de confirmation en cliquant sur Supprimer", () => {
      cy.get("table tbody tr")
        .first()
        .trigger("mouseover")
        .find("button[title='Supprimer']")
        .click({ force: true });
      cy.get("[role='alertdialog']").should("be.visible");
    });

    it("ferme la modale de confirmation en cliquant sur Annuler", () => {
      cy.get("table tbody tr")
        .first()
        .trigger("mouseover")
        .find("button[title='Supprimer']")
        .click({ force: true });
      cy.get("[role='alertdialog']").within(() => {
        cy.contains("button", "Annuler").click();
      });
      cy.get("[role='alertdialog']").should("not.exist");
    });
  });

  // ── État vide ────────────────────────────────────────────────────────────────

  describe("État vide", () => {
    it("affiche un message quand aucun bénévole ne correspond au filtre", () => {
      cy.interceptApi();
      cy.intercept("GET", "/api/benevoles", { body: [] }).as("getBenevolesEmpty");
      cy.visit("/");
      cy.loginAs("admin");
      cy.visit("/benevoles");
      cy.wait("@getBenevolesEmpty");
      cy.contains("Aucun bénévole trouvé").should("be.visible");
    });
  });
});
