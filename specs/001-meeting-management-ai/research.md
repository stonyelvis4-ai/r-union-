# Research: Smart Meeting Management (001-meeting-management-ai)

**Phase 0 output** — Decisions and rationale for technical context. No NEEDS CLARIFICATION left; choices align with constitution and spec.

---

## 1. Stack (Constitution §4)

**Decision**: Next.js (web), React Native with Expo (mobile), Node.js + Express (backend), PostgreSQL, OpenAI (transcription + summary), cloud object storage (audio), JWT (auth).

**Rationale**: Constitution mandates this stack. Single backend serves both web and mobile; one API simplifies auth, meetings, recording metadata, transcription trigger, and report generation.

**Alternatives considered**: Separate backends per client (rejected: higher maintenance). Serverless for transcription (acceptable later as optimization; initial implementation can be sync or background job from same backend).

---

## 2. Transcription & Summary Pipeline

**Decision**: Backend receives uploaded audio (or URL from cloud storage), calls OpenAI (or designated speech-to-text API), stores transcription; when transcription is ready, trigger automatic summary generation (OpenAI or similar), then persist summary and trigger email + PDF/Word export.

**Rationale**: Spec requires automatic report generation when transcription is available; no manual trigger. Backend-controlled pipeline ensures a single place for retries and observability.

**Alternatives considered**: Client-triggered summary (rejected: spec says automatic). Third-party meeting-summary SaaS (acceptable if product owner chooses; constitution allows “OpenAI for transcription and summarization”).

---

## 3. QR Code & Attendance

**Decision**: Backend generates a unique, meeting-scoped token (or meeting ID) and exposes a stable URL; QR encodes this URL. Scanning (web or mobile) sends the token to the API; API creates or idempotently updates one attendance record per (meeting, identity-or-anonymous). Identity: when user is logged in, use user id; when not, optional name/email or anonymous as per FR-007.

**Rationale**: Spec allows anyone with the QR to scan (including unauthenticated); identity when logged in, optional/anonymous otherwise. Idempotent scan avoids duplicate attendance for same participant.

**Alternatives considered**: Time-limited QR (not required by spec; can be added later). Requiring login to scan (rejected: spec says anyone with QR).

---

## 4. Mobile Offline (QR Scan)

**Decision**: Mobile app queues “pending attendance” events locally when offline (e.g. SQLite or async storage). When connectivity is restored, sync queue to backend (POST attendance); show user feedback (“Attendance will be recorded when you’re back online” / “Synced”).

**Rationale**: Spec (clarification) requires queue and sync when back online; clear user feedback.

**Alternatives considered**: Require online to scan (rejected: spec chose queue + sync).

---

## 5. Participants (Email-Only, No Account)

**Decision**: Participants are represented by email (and optional display name) linked to a meeting. No platform account required. Report distribution uses these emails; attendance may be anonymous or with optional identifier when scanner is not logged in.

**Rationale**: Spec clarification: invitation by email only; guests, no account required.

**Alternatives considered**: Require sign-up for participants (rejected: spec). Linking participant email to User when they later register (allowed as extension in data model).

---

## 6. Report Export (PDF and Word)

**Decision**: Backend (or dedicated service) generates report content (structured data); export as PDF and as Word (e.g. docx). API returns file or redirect to signed download URL.

**Rationale**: Spec and constitution: export PDF or Word.

**Alternatives considered**: PDF only (rejected: spec clarification B).

---

## 7. Security & Auth

**Decision**: JWT for API auth; passwords hashed (e.g. bcrypt/argon2). Protected routes by role (Admin, Organizer, Participant). Input validation and sanitization on all inputs; rate limiting and CORS as per best practice.

**Rationale**: Constitution §7 and spec FR-021–FR-023.

**Alternatives considered**: Session-only auth (rejected: constitution specifies JWT). SSO/OAuth (can be added later; not required for first release).

---

## 8. Audio Storage

**Decision**: Audio files stored in cloud object storage (S3-compatible or similar); backend stores only reference (URL or key), meeting ID, duration, creation time. Recording upload can be from web (after stop) or from mobile; backend triggers transcription job when file is ready.

**Rationale**: Constitution: cloud storage for recordings; spec FR-009.

**Alternatives considered**: DB BLOB (rejected: not scalable). Client-side only (rejected: spec requires secure save and server-side transcription).

---

## Summary

All Technical Context items are resolved. No blocking unknowns. Phase 1 can proceed to data model, contracts, and quickstart.
