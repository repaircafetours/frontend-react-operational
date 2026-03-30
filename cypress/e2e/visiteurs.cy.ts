// ── Tests : Page Visiteurs ────────────────────────────────────────────────────

describe("Page Visiteurs", () => {
  beforeEach(() => {
    cy.interceptApi();
  });

  // ── Affichage du tableau ────────────────────────────────────────────────────

  describe("Affichage du tableau", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.loginAs("admin");
      cy.visit("/visiteurs");
      cy.wait("@getVisiteurs");
    });

    it("affiche le titre Visiteurs", () => {
      cy.contains("h1", "Visiteurs").should("be.visible");
    });

    it("affiche le nombre total de visiteurs", () => {
      cy.contains("6 visiteurs enregistrés").should("be.visible");
    });

    it("affiche les en-têtes du tableau", () => {
      cy.get("table thead").within(() => {
        cy.contains("Visiteur").should("be.visible");
        cy.contains("Email").should("be.visible");
        cy.contains("Téléphone").should("be.visible");
        cy.contains("Objets").should("be.visible");
        cy.contains("Inscrit le").should("be.visible");
        cy.contains("Actions").should("be.visible");
      });
    });

    it("affiche les visiteurs dans le tableau", () => {
      cy.get("table tbody tr").should("have.length", 6);
    });

    it("affiche les informations de Jean Lefebvre", () => {
      cy.get("table tbody").within(() => {
        cy.contains("Jean").should("be.visible");
        cy.contains("LEFEBVRE").should("be.visible");
        cy.contains("jean.lefebvre@mail.fr").should("be.visible");
      });
    });

    it("affiche les initiales dans l'avatar", () => {
      cy.get("table tbody tr").first().contains("JL").should("be.visible");
    });

    it("affiche le numéro de téléphone formaté", () => {
      cy.get("table tbody").contains("06 12 34 56 78").should("be.visible");
    });

    it("affiche le nombre d'objets par visiteur", () => {
      cy.get("table tbody tr").first().contains("1 objet").should("be.visible");
    });

    it("affiche 2 objets pour Claire Dubois", () => {
      cy.get("table tbody").contains("Claire").parents("tr").within(() => {
        cy.contains("2 objets").should("be.visible");
      });
    });

    it("affiche un badge warning pour les objets en attente ou en cours", () => {
      // Fatima Ouidir a 1 objet en_cours
      cy.get("table tbody").contains("Fatima").parents("tr").within(() => {
        cy.get("[class*='warning']").should("exist");
      });
    });

    it("affiche la date d'inscription", () => {
      cy.get("table tbody tr").first().within(() => {
        cy.contains("15/03/2024").should("be.visible");
      });
    });
  });

  // ── Barre de recherche ─────────────────────────────────────────────────────

  describe("Barre de recherche", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.loginAs("admin");
      cy.visit("/visiteurs");
      cy.wait("@getVisiteurs");
    });

    it("affiche la barre de recherche", () => {
      cy.get("input[placeholder*='Rechercher']").should("be.visible");
    });

    it("filtre les visiteurs par prénom", () => {
      cy.get("input[placeholder*='Rechercher']").type("Jean");
      cy.get("table tbody tr").should("have.length", 1);
      cy.get("table tbody").contains("Jean").should("be.visible");
    });

    it("filtre les visiteurs par nom", () => {
      cy.get("input[placeholder*='Rechercher']").type("Dupont");
      cy.get("table tbody tr").should("have.length", 0).then(() => {
        // Dupont n'est pas un visiteur, test d'état vide
        cy.contains("Aucun visiteur trouvé").should("be.visible");
      });
    });

    it("filtre les visiteurs par nom (existant)", () => {
      cy.get("input[placeholder*='Rechercher']").type("Garnier");
      cy.get("table tbody tr").should("have.length", 1);
      cy.contains("Antoine").should("be.visible");
    });

    it("est insensible à la casse", () => {
      cy.get("input[placeholder*='Rechercher']").type("lefebvre");
      cy.get("table tbody tr").should("have.length", 1);
      cy.contains("Jean").should("be.visible");
    });

    it("remet à jour le tableau quand la recherche est effacée", () => {
      cy.get("input[placeholder*='Rechercher']").type("Jean");
      cy.get("table tbody tr").should("have.length", 1);
      cy.get("input[placeholder*='Rechercher']").clear();
      cy.get("table tbody tr").should("have.length", 6);
    });

    it("affiche un message quand aucun résultat", () => {
      cy.get("input[placeholder*='Rechercher']").type("zzz_inconnu");
      cy.contains("Aucun visiteur trouvé").should("be.visible");
    });
  });

  // ── Navigation vers le détail ──────────────────────────────────────────────

  describe("Navigation vers le détail", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.loginAs("benevole");
      cy.visit("/visiteurs");
      cy.wait("@getVisiteurs");
    });

    it("navigue vers la page de détail en cliquant sur une ligne", () => {
      cy.get("table tbody tr").first().click();
      cy.url().should("include", "/visiteurs/1");
    });

    it("navigue vers la bonne page pour un autre visiteur", () => {
      cy.get("table tbody").contains("Fatima").parents("tr").click();
      cy.url().should("include", "/visiteurs/2");
    });
  });

  // ── Actions Admin ──────────────────────────────────────────────────────────

  describe("Actions administrateur", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.loginAs("admin");
      cy.visit("/visiteurs");
      cy.wait("@getVisiteurs");
    });

    it("affiche le bouton Ajouter pour un admin", () => {
      cy.contains("button", "Ajouter").should("be.visible");
    });

    it("ouvre la modale d'ajout en cliquant sur Ajouter", () => {
      cy.contains("button", "Ajouter").click();
      cy.get("[role='dialog']").should("be.visible");
    });

    it("ferme la modale en cliquant sur Annuler", () => {
      cy.contains("button", "Ajouter").click();
      cy.get("[role='dialog']").should("be.visible");
      cy.get("[role='dialog']").contains("button", "Annuler").click();
      cy.get("[role='dialog']").should("not.exist");
    });

    it("affiche les boutons d'édition et suppression sur la ligne", () => {
      cy.get("table tbody tr").first().within(() => {
        cy.get("button[title='Modifier']").should("exist");
        cy.get("button[title='Supprimer']").should("exist");
      });
    });

    it("ouvre la modale d'édition en cliquant sur Modifier", () => {
      cy.get("table tbody tr").first().within(() => {
        cy.get("button[title='Modifier']").click({ force: true });
      });
      cy.get("[role='dialog']").should("be.visible");
    });

    it("ouvre la confirmation de suppression en cliquant sur Supprimer", () => {
      cy.get("table tbody tr").first().within(() => {
        cy.get("button[title='Supprimer']").click({ force: true });
      });
      cy.get("[role='alertdialog']").should("be.visible");
    });

    it("ferme la confirmation de suppression en cliquant sur Annuler", () => {
      cy.get("table tbody tr").first().within(() => {
        cy.get("button[title='Supprimer']").click({ force: true });
      });
      cy.get("[role='alertdialog']").contains("button", "Annuler").click();
      cy.get("[role='alertdialog']").should("not.exist");
    });
  });

  // ── Vue Bénévole (lecture seule) ───────────────────────────────────────────

  describe("Vue bénévole (lecture seule)", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.loginAs("benevole");
      cy.visit("/visiteurs");
      cy.wait("@getVisiteurs");
    });

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

    it("peut quand même naviguer vers le détail", () => {
      cy.get("table tbody tr").first().click();
      cy.url().should("include", "/visiteurs/1");
    });
  });
});
