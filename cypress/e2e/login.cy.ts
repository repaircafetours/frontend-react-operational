// ── Tests : Page de Login ─────────────────────────────────────────────────────

describe("Page de Login", () => {
  beforeEach(() => {
    // S'assurer qu'on est déconnecté
    cy.clearLocalStorage();
    cy.visit("/");
  });

  // ── Affichage ───────────────────────────────────────────────────────────────

  describe("Affichage initial", () => {
    it("affiche le titre RepairCafé", () => {
      cy.contains("Repair").should("be.visible");
      cy.contains("Café").should("be.visible");
    });

    it("affiche les 3 cartes de profil", () => {
      cy.contains("Administrateur").should("be.visible");
      cy.contains("Bénévole").should("be.visible");
      cy.contains("Intendant").should("be.visible");
    });

    it("affiche la description de chaque profil", () => {
      cy.contains("Accès complet lecture/écriture").should("be.visible");
      cy.contains("Accès en lecture").should("be.visible");
      cy.contains("Régime alimentaire uniquement").should("be.visible");
    });

    it("affiche le bouton Connexion désactivé par défaut", () => {
      cy.contains("button", "Connexion").should("be.disabled");
    });

    it("affiche le message de sélection de profil", () => {
      cy.contains("Choisissez votre profil").should("be.visible");
    });
  });

  // ── Sélection de profil ─────────────────────────────────────────────────────

  describe("Sélection de profil", () => {
    it("active le bouton Connexion après sélection d'un profil", () => {
      cy.contains("Administrateur").click();
      cy.contains("button", "Connexion").should("not.be.disabled");
    });

    it("met en évidence la carte sélectionnée", () => {
      cy.contains("Administrateur").parents("[class*='cursor-pointer']").as("adminCard");
      cy.get("@adminCard").click();
      cy.get("@adminCard").should("have.class", "border-primary");
    });

    it("change la sélection en cliquant sur une autre carte", () => {
      cy.contains("Administrateur").parents("[class*='cursor-pointer']").click();
      cy.contains("Bénévole").parents("[class*='cursor-pointer']").as("benevoleCard");
      cy.get("@benevoleCard").click();
      cy.get("@benevoleCard").should("have.class", "border-primary");
    });

    it("le bouton reste actif quelle que soit la carte sélectionnée", () => {
      const roles = ["Administrateur", "Bénévole", "Intendant"];
      roles.forEach((role) => {
        cy.contains(role).click();
        cy.contains("button", "Connexion").should("not.be.disabled");
      });
    });
  });

  // ── Connexion Admin ─────────────────────────────────────────────────────────

  describe("Connexion en tant qu'Administrateur", () => {
    beforeEach(() => {
      cy.interceptApi();
    });

    it("redirige vers /dashboard après connexion admin", () => {
      cy.contains("Administrateur").click();
      cy.contains("button", "Connexion").click();
      cy.url().should("include", "/dashboard");
    });

    it("affiche la sidebar après connexion admin", () => {
      cy.contains("Administrateur").click();
      cy.contains("button", "Connexion").click();
      cy.get("aside").should("be.visible");
    });

    it("affiche le nom de l'utilisateur dans la sidebar", () => {
      cy.contains("Administrateur").click();
      cy.contains("button", "Connexion").click();
      cy.get("aside").contains("Sophie").should("be.visible");
    });

    it("affiche le badge Admin dans la sidebar", () => {
      cy.contains("Administrateur").click();
      cy.contains("button", "Connexion").click();
      cy.get("aside").contains("Admin").should("be.visible");
    });
  });

  // ── Connexion Bénévole ──────────────────────────────────────────────────────

  describe("Connexion en tant que Bénévole", () => {
    beforeEach(() => {
      cy.interceptApi();
    });

    it("redirige vers /dashboard après connexion bénévole", () => {
      cy.contains("Bénévole").click();
      cy.contains("button", "Connexion").click();
      cy.url().should("include", "/dashboard");
    });

    it("affiche le badge Bénévole dans la sidebar", () => {
      cy.contains("Bénévole").click();
      cy.contains("button", "Connexion").click();
      cy.get("aside").contains("Bénévole").should("be.visible");
    });
  });

  // ── Connexion Intendant ─────────────────────────────────────────────────────

  describe("Connexion en tant qu'Intendant", () => {
    beforeEach(() => {
      cy.interceptApi();
    });

    it("redirige vers /intendance après connexion intendant", () => {
      cy.contains("Intendant").click();
      cy.contains("button", "Connexion").click();
      cy.url().should("include", "/intendance");
    });

    it("affiche uniquement le lien Intendance dans la sidebar", () => {
      cy.contains("Intendant").click();
      cy.contains("button", "Connexion").click();
      cy.get("aside").contains("Intendance").should("be.visible");
      cy.get("aside").contains("Dashboard").should("not.exist");
      cy.get("aside").contains("Bénévoles").should("not.exist");
    });
  });

  // ── Déconnexion ─────────────────────────────────────────────────────────────

  describe("Déconnexion", () => {
    beforeEach(() => {
      cy.interceptApi();
      cy.contains("Administrateur").click();
      cy.contains("button", "Connexion").click();
      cy.url().should("include", "/dashboard");
    });

    it("redirige vers la page de login après déconnexion", () => {
      cy.get("aside").contains("button", "Déconnexion").click();
      cy.url().should("eq", Cypress.config("baseUrl") + "/");
    });

    it("efface la session après déconnexion", () => {
      cy.get("aside").contains("button", "Déconnexion").click();
      cy.window().then((win) => {
        const auth = win.localStorage.getItem("repaircafe-auth");
        const parsed = auth ? JSON.parse(auth) : null;
        expect(parsed?.state?.user).to.be.null;
      });
    });
  });

  // ── Redirection si déjà connecté ────────────────────────────────────────────

  describe("Redirection si déjà connecté", () => {
    it("redirige directement vers /dashboard si session admin active", () => {
      cy.interceptApi();
      // Injecter la session avant de visiter la page
      cy.visit("/", {
        onBeforeLoad(win) {
          win.localStorage.setItem(
            "repaircafe-auth",
            JSON.stringify({
              state: {
                user: {
                  id: 1,
                  nom: "Martin",
                  prenom: "Sophie",
                  email: "sophie@repaircafe.fr",
                  role: "admin",
                },
              },
              version: 0,
            })
          );
        },
      });
      cy.visit("/dashboard");
      cy.url().should("include", "/dashboard");
    });
  });
});
