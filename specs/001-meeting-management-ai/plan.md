# Implementation Plan: Smart Meeting Management (Web & Mobile)

**Branch**: `001-meeting-management-ai` | **Date**: 2025-03-06 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-meeting-management-ai/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Application de gestion de réunions intelligente (Web + Mobile) : création et édition de réunions, présence par scan QR (tout public, avec file d’attente hors ligne sur mobile), enregistrement audio, transcription IA (speech-to-text), génération automatique de comptes-rendus structurés, envoi par email et export PDF/Word. Participants invités par email uniquement (pas de compte requis). Stack alignée sur la constitution : Next.js/React/TypeScript/Tailwind (web), React Native/Expo (mobile), Node/Express (backend), PostgreSQL, JWT, OpenAI, stockage cloud pour l’audio.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20 LTS backend; frontend et mobile en TypeScript)  
**Primary Dependencies**: Next.js 14+, React 18+, Express.js, React Native with Expo, TailwindCSS, PostgreSQL (client pg/Prisma or similar), OpenAI API, JWT (e.g. jsonwebtoken), cloud storage SDK (e.g. S3-compatible)  
**Storage**: PostgreSQL (entities Users, Meetings, Participants, Attendance, Transcriptions, Summaries; metadata Recordings); cloud object storage for audio files  
**Testing**: Jest or Vitest (unit); Supertest or similar (API); React Testing Library (frontend); E2E optional (Playwright/Detox)  
**Target Platform**: Web (desktop/tablet, modern browsers), Mobile (iOS/Android via Expo)  
**Project Type**: web-application + mobile-app (monorepo or separate repos: backend, frontend-web, mobile)  
**Performance Goals**: Page/list load <3s (SC-007); search results <3s (SC-005); transcription within ~10 min for 1h meeting (SC-003); scalable backend  
**Constraints**: Responsive UI; mobile offline queue for QR scan then sync (FR-019); secure auth and encrypted passwords; protected APIs  
**Scale/Scope**: Multi-user organizations; thousands of meetings/recordings/transcriptions over time; export PDF/Word

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify alignment with `.specify/memory/constitution.md`:

- **Purpose & scope**: Feature supports meeting management, attendance (QR), recording, AI transcription/summary, report distribution (Constitution §1–2). **PASS**
- **UX**: Simple, responsive UI; minimal friction for QR scan and meeting join (§3). **PASS**
- **Stack**: Frontend (Next.js/React/TS/Tailwind), Mobile (React Native/Expo), Backend (Node/Express), DB (PostgreSQL), Auth (JWT), AI (OpenAI), storage (cloud audio) as per §4. **PASS**
- **Data**: Entities Users, Meetings, Participants, Attendance, Recordings, Transcriptions, Summaries; validation and security (§5–7). **PASS**
- **Quality**: TypeScript, modular code, REST best practices, tests for key flows (§6, §9). **PASS**
- **Principles**: Simplicity, scalability, maintainability, security, UX (§11). **PASS** — no deviation; Complexity Tracking table left empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-meeting-management-ai/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── config/          # env, db, storage, OpenAI
│   ├── models/          # orm/entities: User, Meeting, Participant, Attendance, Recording, Transcription, Summary
│   ├── services/        # meeting, recording, transcription, summary, email, qr, auth
│   ├── api/             # routes, middleware (auth, validation)
│   └── jobs/            # optional: background transcription + auto summary trigger
└── tests/
    ├── contract/        # API contract tests
    ├── integration/
    └── unit/

frontend/
├── src/
│   ├── components/      # UI: dashboard, meeting form, QR display, recording controls, report view
│   ├── pages/           # Next.js pages (meetings, meeting/:id, search, login, admin)
│   ├── services/        # API client, auth
│   └── hooks/
└── tests/

mobile/
├── src/
│   ├── screens/         # login, meetings list, QR scanner, meeting detail/summary
│   ├── components/
│   ├── services/        # API, auth, offline queue for attendance
│   └── utils/
└── tests/
```

**Structure Decision**: Three main packages — **backend** (Node/Express, API unique pour web et mobile), **frontend** (Next.js pour le web), **mobile** (React Native/Expo). L’API REST est partagée ; le mobile gère la file d’attente hors ligne pour les scans QR et la synchronisation au retour en ligne. Pas de duplication de logique métier entre web et mobile au-delà de l’adaptation UI.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
