# BénevApp

Application de gestion des bénévoles et visiteurs d'événements.

## Stack technique

| Technologie | Usage |
|---|---|
| **Next.js 15** (App Router) | Framework fullstack |
| **TypeScript** | Typage statique complet |
| **Tailwind CSS** | Styles utilitaires |
| **shadcn/ui** + Radix UI | Composants UI accessibles |
| **TanStack Query v5** | Data fetching, cache, mutations |
| **Zustand v5** | État global (auth, session) |
| **React Hook Form** + Zod | Formulaires avec validation |

## Structure du projet

```
benevapp/
├── app/
│   ├── (app)/                    # Route group — pages authentifiées
│   │   ├── layout.tsx            # Layout avec Sidebar + guard auth
│   │   ├── benevoles/page.tsx    # Liste des bénévoles
│   │   └── visiteurs/
│   │       ├── page.tsx          # Liste des visiteurs
│   │       └── [id]/page.tsx     # Détail visiteur + objets
│   ├── api/                      # API Routes Next.js
│   │   ├── benevoles/route.ts    # GET /api/benevoles, POST
│   │   ├── benevoles/[id]/       # DELETE /api/benevoles/:id
│   │   └── visiteurs/            # CRUD visiteurs + objets
│   ├── page.tsx                  # Page de login
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # TanStack Query provider
│   └── globals.css               # Variables CSS / Tailwind
├── components/
│   ├── ui/                       # Composants shadcn/ui
│   ├── modals/                   # BenevoleModal, VisiteurModal, ObjetModal
│   ├── Sidebar.tsx               # Navigation latérale
│   └── DeleteConfirm.tsx         # Dialog de confirmation
├── hooks/
│   ├── useBenevoles.ts           # Queries + mutations bénévoles
│   └── useVisiteurs.ts           # Queries + mutations visiteurs + objets
├── store/
│   └── auth.ts                   # Zustand store (session utilisateur)
├── types/
│   └── index.ts                  # Types TypeScript du domaine
└── lib/
    ├── utils.ts                  # cn(), initials(), formatDate()
    └── data.ts                   # Base de données in-memory (mock)
```

## Installation et lancement

```bash
# Installer les dépendances
npm install
# ou
bun install

# Lancer en développement
npm run dev
# ou
bun run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Fonctionnalités

### Rôle Bénévole
- Consulter la liste des bénévoles
- Consulter la liste des visiteurs et leur événement
- Voir les objets déposés par un visiteur (avec statut restitué/en attente)
- Marquer un objet comme restitué

### Rôle Admin (toutes les permissions bénévole +)
- Ajouter / supprimer des bénévoles
- Ajouter / supprimer des visiteurs
- Ajouter / supprimer des objets pour un visiteur

## API Routes

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/benevoles` | Liste des bénévoles |
| POST | `/api/benevoles` | Créer un bénévole |
| DELETE | `/api/benevoles/:id` | Supprimer un bénévole |
| GET | `/api/visiteurs` | Liste des visiteurs |
| POST | `/api/visiteurs` | Créer un visiteur |
| GET | `/api/visiteurs/:id` | Détail d'un visiteur |
| DELETE | `/api/visiteurs/:id` | Supprimer un visiteur |
| POST | `/api/visiteurs/:id/objets` | Ajouter un objet |
| PATCH | `/api/visiteurs/:id/objets/:objetId` | Modifier un objet (restitué) |
| DELETE | `/api/visiteurs/:id/objets/:objetId` | Supprimer un objet |
