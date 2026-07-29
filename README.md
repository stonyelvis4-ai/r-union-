# SmartReunion

Application de gestion de réunions (web + mobile) avec enregistrement audio, transcription IA, rapports automatiques et présence par scan QR.

## Stack

- **Backend** : Node.js 20, Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt
- **Frontend** : Next.js 14, React, Tailwind CSS
- **Mobile** : React Native, Expo (Expo Router)
- **IA** : OpenAI (Whisper pour transcription, GPT pour résumés)

## Prérequis

- Node.js 20+
- PostgreSQL 15+
- Compte OpenAI (clé API pour transcription et résumés)

## Installation rapide

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # puis éditer .env
```

Créer `.env` avec au minimum :

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/smartreunion
JWT_SECRET=votre-secret-jwt
PORT=4000
```

Optionnel : `OPENAI_API_KEY` pour la transcription et les résumés.

**Migrations** :

```bash
npm run postinstall   # prisma generate
# Appliquer les migrations SQL dans prisma/migrations/ (ou prisma migrate dev si DB configurée)
npm run dev
```

API : `http://localhost:4000` (racine : `GET /api`).

### 2. Frontend

```bash
cd frontend
npm install
```

Créer `frontend/.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

```bash
npm run dev
```

App web : `http://localhost:3000`.

## Déploiement Vercel (frontend)

Le frontend Next.js peut être déployé sur Vercel. Dans l’écran d’import du dépôt, définir **Root Directory** sur `frontend`.

Dans les variables d’environnement Vercel, ajouter :

```env
NEXT_PUBLIC_API_URL=https://votre-api.example.com/api
```

Cette valeur doit être l’URL HTTPS publique du backend et inclure `/api`. L’API Express et la base PostgreSQL ne peuvent pas utiliser `localhost` en production : hébergez-les séparément (par exemple Render, Railway ou une API Vercel adaptée au serverless) puis configurez aussi `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY` et, si besoin, les variables SMTP uniquement dans cet hébergement backend.

### 3. Mobile (Expo)

```bash
cd mobile
npm install
npx expo start
```

Ouvrir avec Expo Go (appareil ou simulateur). Par défaut l’API est `http://localhost:4000/api` (simulateur). Sur appareil physique, utiliser l’IP de la machine (ex. `http://192.168.1.x:4000/api`) et configurer dans `mobile/services/api.ts` ou via variable d’environnement Expo.

## Fonctionnalités

- **Réunions** : création, édition, suppression ; ordre du jour, participants (email), QR unique
- **Présence** : scan QR (web ou mobile) pour enregistrer la présence ; idempotent par utilisateur
- **Enregistrement** : démarrage / pause / arrêt ; envoi du fichier audio ; transcription (Whisper si clé API)
- **Rapport** : résumé généré après transcription ; envoi email aux participants (stub) ; export PDF et Word
- **Recherche** : par titre, dates, ordre du jour, optionnellement dans les transcriptions
- **Admin** : gestion des utilisateurs (création, rôle, désactivation)
- **Mobile** : connexion, liste des réunions, scan QR présence, file d’attente hors ligne, détail réunion et rapport

## Structure

```
backend/     # API Express + Prisma
frontend/    # Next.js App Router
mobile/      # Expo (Expo Router)
specs/       # Specs et tâches (001-meeting-management-ai)
```

## Tests

```bash
cd backend && npm test          # tests contrat (nécessite DATABASE_URL)
```

## Documentation

- Spécifications et plan : `specs/001-meeting-management-ai/`
- Quickstart détaillé : `specs/001-meeting-management-ai/quickstart.md`
