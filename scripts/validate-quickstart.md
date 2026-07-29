# Validation du quickstart (T065)

Ce document décrit comment valider le flux complet : backend + frontend + DB + storage — création de réunion, scan de présence, enregistrement, résumé, téléchargement du rapport.

## Prérequis

- PostgreSQL démarré, base `SMARTREUNION` créée, schéma appliqué (`backend/scripts/run-schema.js` ou SQL manuel).
- Backend : `cd backend && npm run dev` (port 4000).
- Frontend : `cd frontend && npm run dev` (port 3000).
- `.env` backend avec `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, storage (S3 ou local).

## Étapes de validation

### 1. Auth

- Ouvrir http://localhost:3000
- S’inscrire ou se connecter (rôle Organizer ou Admin).
- Vérifier que le tableau de bord ou la liste des réunions s’affiche.

### 2. Créer une réunion

- Aller sur « Nouvelle réunion » (ou `/meetings/new`).
- Renseigner : titre, date, heure, lieu, ordre du jour, participants (emails).
- Soumettre → redirection vers la page de détail de la réunion.
- Vérifier : titre, date, heure, participants, bloc QR (token + lien).

### 3. Modifier / Supprimer (US1)

- Sur la page de détail, cliquer « Modifier » → formulaire pré-rempli.
- Changer le titre ou le statut, enregistrer → retour détail avec données à jour.
- (Optionnel) « Supprimer » avec confirmation → redirection vers la liste des réunions.

### 4. Présence (scan QR)

- Depuis la page de détail de la réunion : utiliser le lien QR ou le token affiché.
- **Web** : composant « Marquer ma présence » : saisir le token ou afficher le QR pour scan → `POST /api/attendance/scan`.
- **Mobile** : ouvrir l’app Expo, se connecter, aller sur « Scan », scanner le QR de la réunion (ou saisir le token).
- Vérifier sur la page de détail : section « Présences » mise à jour avec le scan.

### 5. Enregistrement + transcription (US3)

- Sur la page de détail : « Démarrer l’enregistrement ».
- Parler quelques secondes (ou laisser du silence), puis « Arrêter l’enregistrement ».
- Vérifier que l’audio est envoyé (indicateur / message de succès).
- Attendre que la transcription passe à « complète » (ou « Transcription en cours… » puis texte affiché).
- En cas d’échec : vérifier `OPENAI_API_KEY` et les logs backend ; utiliser « Réessayer la transcription » si disponible.

### 6. Rapport (US4)

- Une fois la transcription complète : bouton « Générer le rapport » (si pas encore généré).
- Vérifier l’affichage du résumé (sections : décisions, actions, etc.).
- Télécharger le rapport : boutons PDF et Word → fichier téléchargé (PDF ou .docx).

### 7. Recherche / filtres (US5)

- Aller sur la liste des réunions.
- Utiliser la recherche par texte et les filtres (dates, organisateur si admin).
- Vérifier que les résultats correspondent aux critères.

### 8. Mobile hors ligne (US6, T055)

- Sur l’app mobile : couper le réseau (mode avion ou désactiver Wi-Fi).
- Scanner un QR d’une réunion (token enregistré en file d’attente locale).
- Vérifier le message du type « Hors ligne : enregistré, sera synchronisé plus tard » et le compteur de scans en attente.
- Réactiver le réseau et rouvrir l’app (ou revenir sur l’écran).
- Vérifier que les scans sont synchronisés (`POST /api/attendance/sync`) et que les présences apparaissent sur la page de détail de la réunion (web).

### 9. Admin (US7)

- Se connecter avec un compte Admin.
- Aller sur la gestion des utilisateurs (ex. `/admin/users`).
- Créer un utilisateur (email, mot de passe, rôle), modifier, (désactiver si implémenté).

## Validation API (optionnel)

Avec un outil type curl ou Postman :

1. `POST /api/auth/login` avec `{ "email", "password" }` → récupérer `token`.
2. `POST /api/meetings` avec `Authorization: Bearer <token>` et body `{ title, date, time, participantEmails }` → récupérer `id`, `qrToken`.
3. `POST /api/attendance/scan` avec `{ "qrToken": "<qrToken>" }` → 200 et attendance.
4. `GET /api/meetings/:id/attendance` → liste avec le scan.
5. `POST /api/meetings/:id/recording/start` puis `.../stop` (avec upload si requis par l’API).
6. `GET /api/meetings/:id/transcription` jusqu’à `status: complete`.
7. `POST /api/meetings/:id/summary/generate` puis `GET /api/meetings/:id/summary`.
8. `GET /api/meetings/:id/report?format=pdf` → fichier binaire.

## Tests automatisés

- Backend : `cd backend && npm test` (tests unitaires + contrats).
- Frontend : `cd frontend && npm test`.
- Mobile : `cd mobile && npm test`.

Si tous les points ci-dessus passent, le quickstart de bout en bout (T065) est validé.
