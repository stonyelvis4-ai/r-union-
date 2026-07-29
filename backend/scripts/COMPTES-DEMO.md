# Comptes de démonstration

Ces comptes permettent de tester l’application (web et mobile) sans créer de nouveaux utilisateurs à la main.

## Créer les comptes

Depuis le dossier **backend** :

```bash
node scripts/seed-users.js
```

Prérequis : fichier `.env` avec `DATABASE_URL` et base PostgreSQL avec le schéma déjà appliqué.

## Identifiants (mot de passe commun : **Demo123!**)

| Rôle         | Email                   | Usage |
|-------------|-------------------------|--------|
| **Admin**   | `admin@demo.local`      | Gestion des utilisateurs (`/admin/users`), toutes les réunions, recherche. |
| **Organisateur** | `organizer@demo.local` | Créer / modifier / supprimer des réunions, lancer enregistrement, générer rapports. |
| **Participant** | `participant@demo.local` | Se connecter, voir les réunions auxquelles il est invité, scanner le QR pour présence, consulter les résumés. |

## Connexion

- **Frontend** : http://localhost:3000 → Connexion → saisir l’email et le mot de passe.
- **Mobile** : même email / mot de passe dans l’écran de connexion.

## Sécurité

- **Ne pas utiliser ces comptes en production.** Mot de passe faible et emails prévisibles.
- En production : désactiver ou supprimer ces comptes, ou changer les mots de passe.
