# Quickstart: Smart Meeting Management

**Feature**: 001-meeting-management-ai  
**Purpose**: Get backend, frontend, and (optionally) mobile running locally for development.

---

## Prerequisites

- **Node.js** 20 LTS
- **pnpm** or **npm** (monorepo: pnpm recommended)
- **PostgreSQL** 15+ (local or Docker)
- **Cloud storage**: S3-compatible bucket or local/minio for audio files
- **OpenAI** API key (transcription + summary)
- **Optional**: Expo CLI for mobile (`npx expo`)

---

## 1. Repository & env

```bash
git clone <repo-url>
cd SMARTREUNION
git checkout 001-meeting-management-ai
```

Create env files (do not commit secrets):

**backend/.env**

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:pass@localhost:5432/smartreunion
JWT_SECRET=<random-secret>
OPENAI_API_KEY=<key>
STORAGE_PROVIDER=s3
STORAGE_BUCKET=smartreunion-audio
STORAGE_REGION=eu-west-1
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
# Optional: S3 endpoint for minio
# S3_ENDPOINT=http://localhost:9000
FRONTEND_URL=http://localhost:3000
```

**frontend/.env.local**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

**mobile**: configure API base URL in app config (e.g. `http://localhost:4000/api` for device/emulator; use machine IP if testing on device).

---

## 2. Database

```bash
cd backend
npm install
npx prisma generate
# Appliquer les migrations (fichiers SQL dans prisma/migrations/)
# Ou si la base est configurée : npx prisma migrate dev
```

Ensure PostgreSQL is running and `DATABASE_URL` is correct.

---

## 3. Backend

```bash
cd backend
npm install
npm run dev
```

API available at `http://localhost:4000`. Root: `GET /api`.

---

## 4. Frontend (Web)

```bash
cd frontend
npm install
```

Create `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:4000/api`.

```bash
npm run dev
```

Web app at `http://localhost:3000`. Register or login (Organizer/Admin) to create meetings.

---

## 5. Mobile (Expo)

```bash
cd mobile
npm install
npx expo start
```

Scan QR with Expo Go or run on simulator. API base URL is in `mobile/services/api.ts` (default `http://localhost:4000/api`). For a physical device, use your machine's LAN IP (e.g. `http://192.168.1.x:4000/api`).

---

## 6. Minimal verification

1. **Auth**: Register or login via `/api/auth/login` → obtain JWT.
2. **Meeting**: Create meeting `POST /api/meetings` with title, date, time, participantEmails → get `qrToken`.
3. **QR**: Open `/api/meetings/:id/qr` or encode `qrToken` in QR; call `POST /api/attendance/scan` with `{ qrToken }` → attendance created.
4. **Recording**: Start/stop recording via API; upload audio; confirm transcription job runs and summary is generated when transcription completes.
5. **Report**: `GET /api/meetings/:id/report?format=pdf` (and `format=docx`) returns file.

---

## 7. Tests

```bash
# Backend contract tests (requires DATABASE_URL)
cd backend && npm test
```

**Validation du flux complet (T065)** : voir [scripts/validate-quickstart.md](../../scripts/validate-quickstart.md) pour les étapes de validation bout en bout (création réunion, scan, enregistrement, résumé, téléchargement rapport).

---

## Troubleshooting

- **DB connection**: Check `DATABASE_URL` and PostgreSQL is up.
- **CORS**: Backend must allow `FRONTEND_URL` and mobile origin.
- **Storage**: Ensure bucket exists and credentials have read/write; for local dev, minio or file-backed stub is acceptable.
- **OpenAI**: Valid key and quota; transcription can be slow or fail on long audio — check logs and retry endpoint.
- **Mobile offline** : Les scans en attente sont synchronisés au retour de l’app (ou au prochain lancement) via `POST /api/attendance/sync`. Vérifier que le token est valide.
- **Sécurité** : Toutes les routes sensibles sont protégées par JWT et rôle (requireAuth, requireOrganizer, requireAdmin). Ne pas exposer JWT_SECRET ni les clés API côté frontend/mobile. Limiter les requêtes sur `/auth/login` et `/attendance/scan` en production (rate limiting recommandé).

---

## References

- **Spec**: [spec.md](../spec.md)
- **Plan**: [plan.md](../plan.md)
- **Data model**: [data-model.md](../data-model.md)
- **API contract**: [contracts/api.md](../contracts/api.md)
