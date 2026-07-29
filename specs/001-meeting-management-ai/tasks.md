---
description: "Task list for Smart Meeting Management (Web & Mobile)"
---

# Tasks: Smart Meeting Management (Web & Mobile)

**Input**: Design documents from `specs/001-meeting-management-ai/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included per constitution (§9): unit tests for key features, API testing, validation of critical workflows.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1–US7) for story phases only
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`
- **Mobile**: `mobile/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per plan.md

- [x] T001 Create repository structure: backend/, frontend/, mobile/ with package.json in each per plan.md
- [x] T002 Initialize backend: Node 20, TypeScript, Express in backend/ with tsconfig and script dev/build
- [x] T003 Initialize frontend: Next.js 14+ with TypeScript and TailwindCSS in frontend/
- [x] T004 Initialize mobile: React Native with Expo and TypeScript in mobile/
- [x] T005 [P] Configure ESLint and Prettier in backend/, frontend/, and mobile/
- [x] T006 Create backend env schema and config loader in backend/src/config/env.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Setup PostgreSQL connection and migrations framework (e.g. Prisma or Knex) in backend/
- [x] T008 [P] Create User entity and migration (id, email, name, passwordHash, role, isActive, timestamps) per data-model.md in backend/src/models/ or Prisma schema
- [x] T009 Implement password hashing (bcrypt or argon2) and JWT issue/verify in backend/src/services/auth.ts
- [x] T010 Implement auth routes: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me in backend/src/api/routes/auth.ts
- [x] T011 Implement auth middleware: validate Bearer JWT, attach user to request, optional for public routes in backend/src/api/middleware/auth.ts
- [x] T012 Setup API routing structure and global error handler in backend/src/api/ (e.g. Express router, 400/401/403/404/500)
- [x] T013 Configure CORS and request validation (e.g. express-validator or Zod) in backend/src/api/
- [x] T014 Add input sanitization and validation helpers to prevent XSS/injection in backend/src/api/middleware/validate.ts

**Checkpoint**: Auth and API skeleton ready; user story implementation can begin

---

## Phase 3: User Story 1 – Organizer Creates Meeting and Invites Participants (Priority: P1) 🎯 MVP

**Goal**: Organizer creates meeting with title, date, time, location, agenda; invites participants by email; system generates unique QR; dashboard shows meetings; edit/delete.

**Independent Test**: Create a meeting with agenda and participants, verify dashboard and unique QR; edit and delete meeting.

### Tests for User Story 1

- [x] T015 [P] [US1] Contract test POST /api/meetings and GET /api/meetings in backend/tests/contract/meetings.test.ts
- [x] T016 [P] [US1] Contract test GET /api/meetings/:id/qr (with qrToken) in backend/tests/contract/meetings-qr.test.ts

### Implementation for User Story 1

- [x] T017 [P] [US1] Create Meeting entity and migration (title, date, time, location, agenda, status, ownerId, qrToken, timestamps) in backend per data-model.md
- [x] T018 [P] [US1] Create Participant entity and migration (meetingId, email, displayName, createdAt) with unique (meetingId, email) in backend
- [x] T019 [US1] Implement meeting service: create (generate qrToken), get, update, delete, list by owner in backend/src/services/meeting.ts
- [x] T020 [US1] Implement participant service: add by email, list by meeting, remove in backend/src/services/participant.ts
- [x] T021 [US1] Implement meetings API: GET/POST /api/meetings, GET/PATCH/DELETE /api/meetings/:id, GET /api/meetings/:id/qr (public by qrToken), GET/POST/DELETE participants in backend/src/api/routes/meetings.ts
- [x] T022 [US1] Add role middleware: require Organizer for create/update/delete meeting in backend/src/api/middleware/roles.ts
- [x] T023 [US1] Dashboard page: list upcoming and past meetings with status in frontend/src/pages/meetings/index.tsx (or app/meetings/page.tsx)
- [x] T024 [US1] Meeting form page: create/edit meeting (title, date, time, location, agenda, participant emails) in frontend/src/pages/meetings/new.tsx and edit page
- [x] T025 [US1] Meeting detail page: show meeting, participants, and QR code (image or data URL for download) in frontend/src/pages/meetings/[id].tsx

**Checkpoint**: User Story 1 complete; create meeting, invite by email, view dashboard, QR available, edit/delete

---

## Phase 4: User Story 2 – Participant Marks Attendance by Scanning QR (Priority: P2)

**Goal**: Anyone with QR can scan (web or mobile); attendance recorded with meeting ID and scan time; identity when logged in; idempotent per user+meeting.

**Independent Test**: Scan QR (authenticated and unauthenticated); verify attendance list for meeting.

### Tests for User Story 2

- [x] T026 [P] [US2] Contract test POST /api/attendance/scan (with qrToken, no auth and with auth) in backend/tests/contract/attendance.test.ts
- [x] T027 [P] [US2] Contract test GET /api/meetings/:id/attendance in backend/tests/contract/attendance.test.ts

### Implementation for User Story 2

- [x] T028 [P] [US2] Create Attendance entity and migration (meetingId, scannedAt, userId, attendeeName, attendeeEmail) in backend per data-model.md
- [x] T029 [US2] Implement attendance service: record scan (idempotent by meetingId+userId), list by meeting in backend/src/services/attendance.ts
- [x] T030 [US2] Implement POST /api/attendance/scan (body qrToken or meetingId; optional auth; idempotent) and GET /api/meetings/:id/attendance in backend/src/api/routes/attendance.ts
- [x] T031 [US2] Add attendance list and scan-time display to meeting detail page in frontend/src/pages/meetings/[id].tsx
- [x] T032 [US2] Add “Mark attendance” flow on web: page or modal that accepts qrToken or scans QR (e.g. camera or manual entry) and calls POST /api/attendance/scan in frontend/src/components/AttendanceScan.tsx or page

**Checkpoint**: User Story 2 complete; scan QR records attendance; organizer sees attendees

---

## Phase 5: User Story 3 – Organizer Records Meeting and Obtains Transcription (Priority: P3)

**Goal**: Start/pause/stop recording; audio saved to cloud; transcription via AI speech-to-text; transcription stored and viewable.

**Independent Test**: Start, pause, stop recording; verify audio in storage and transcription appears for meeting.

### Tests for User Story 3

- [x] T033 [P] [US3] Contract test recording endpoints (start, pause, stop) and GET /api/meetings/:id/transcription in backend/tests/contract/recording.test.ts

### Implementation for User Story 3

- [x] T034 [P] [US3] Create AudioRecording and Transcription entities and migrations per data-model.md in backend
- [x] T035 [US3] Implement cloud storage service (upload file, get key/URL) in backend/src/services/storage.ts (S3-compatible)
- [x] T036 [US3] Implement recording service: start (create recording row), pause (state), stop (accept multipart upload, save to storage, set AudioRecording ready) in backend/src/services/recording.ts
- [x] T037 [US3] Implement transcription job: when recording ready, call OpenAI (or configured) speech-to-text, save Transcription (pending→complete/failed) in backend/src/services/transcription.ts or backend/src/jobs/transcription.ts
- [x] T038 [US3] Implement recording API: POST start/pause/stop, GET /api/meetings/:id/recording; GET /api/meetings/:id/transcription and POST retry in backend/src/api/routes/recording.ts and routes/transcription.ts
- [x] T039 [US3] Meeting detail: recording controls (start/pause/stop) and upload audio on stop in frontend (e.g. MediaRecorder API or mobile capture); show transcription status and fullText when complete in frontend/src/pages/meetings/[id].tsx and components

**Checkpoint**: User Story 3 complete; record meeting, audio stored, transcription viewable

---

## Phase 6: User Story 4 – System Generates and Distributes Meeting Report (Priority: P4)

**Goal**: Auto-generate summary when transcription complete; email report to participants; download PDF and Word.

**Independent Test**: Meeting with transcription and participants; verify summary created, email sent, PDF/Word download works.

### Tests for User Story 4

- [x] T040 [P] [US4] Contract test GET /api/meetings/:id/summary and GET /api/meetings/:id/report?format=pdf|docx in backend/tests/contract/summary.test.ts

### Implementation for User Story 4

- [x] T041 [P] [US4] Create Summary entity and migration (meetingId, title, meetingDate, participantsText, discussionSummary, keyDecisions, actionItems, responsiblePersons, nextSteps, generatedAt, version) in backend per data-model.md
- [x] T042 [US4] Implement summary service: generate from transcription (and attendance) via OpenAI or rules; persist Summary; trigger on transcription status→complete in backend/src/services/summary.ts
- [x] T043 [US4] Implement email service: send report to list of emails (participant emails) with link or attachment in backend/src/services/email.ts
- [x] T044 [US4] On summary generation: call email service to send report to meeting participants in backend/src/services/summary.ts or job
- [x] T045 [US4] Implement PDF export and Word export in backend/src/services/report-export.ts
- [x] T046 [US4] Implement GET /api/meetings/:id/summary and GET report in backend/src/api/routes/summary.ts
- [x] T047 [US4] Report view and download buttons (PDF/Word) in frontend/src/pages/meetings/[id].tsx and components/ReportView.tsx

**Checkpoint**: User Story 4 complete; auto summary, email, PDF/Word download

---

## Phase 7: User Story 5 – Users Search and Filter Meetings (Priority: P5)

**Goal**: Search by text, filter by date and organizer, search inside transcripts (SC-005: results <3s).

**Independent Test**: Create meetings with different organizers/dates; search by title and transcript phrase; verify results.

### Implementation for User Story 5

- [x] T048 [US5] Implement search service: query meetings by q (title), dateFrom, dateTo, organizerId; optional full-text search on Transcription.fullText in backend/src/services/search.ts
- [x] T049 [US5] Implement GET /api/meetings/search with query params (q, dateFrom, dateTo, organizerId, searchInTranscript) in backend/src/api/routes/meetings.ts or search.ts
- [x] T050 [US5] Add search and filters UI to meetings list (search box, date range, organizer dropdown) in frontend/src/pages/meetings/index.tsx and components/SearchFilters.tsx

**Checkpoint**: User Story 5 complete; search and filter meetings and transcript

---

## Phase 8: User Story 6 – Mobile: Login, View Meetings, Scan QR, Read Summaries (Priority: P6)

**Goal**: Mobile app: login, meetings list, scan QR for attendance, read summary; offline queue for scan then sync when online.

**Independent Test**: Log in on mobile, view meetings, scan QR, confirm attendance; offline scan then sync; open summary.

### Implementation for User Story 6

- [x] T051 [US6] API client and auth store
- [x] T052 [US6] Login screen
- [x] T053 [US6] Meetings list screen
- [x] T054 [US6] QR scanner screen
- [x] T055 [US6] Offline queue: persist pending scans (meetingId/qrToken, scannedAt) in local storage; on connectivity restore, POST /api/attendance/sync with items; show “Attendance will be recorded when back online” in mobile/src/services/offlineAttendanceQueue.ts and sync on app focus/network change
- [x] T056 [US6] POST /api/attendance/sync
- [x] T057 [US6] Meeting detail screen with summary

**Checkpoint**: User Story 6 complete; mobile login, list, scan QR, offline sync, read summary

---

## Phase 9: User Story 7 – Admin Manages Platform and Users (Priority: P7)

**Goal**: Admin creates/edits/deactivates users and assigns roles (Admin, Organizer, Participant).

**Independent Test**: As admin, create user with role, edit, deactivate; verify only admins can access user management.

### Implementation for User Story 7

- [x] T058 [P] [US7] Create role middleware: requireAdmin in backend/src/api/middleware/roles.ts
- [x] T059 [US7] Implement users API: GET/POST /api/users, GET/PATCH/DELETE /api/users/:id (soft deactivate) in backend/src/api/routes/users.ts
- [x] T060 [US7] Admin users list page: GET /api/users, table with edit/deactivate in frontend/src/pages/admin/users.tsx
- [x] T061 [US7] Admin create/edit user form: email, password, name, role in frontend/src/pages/admin/users/new.tsx and edit

**Checkpoint**: User Story 7 complete; admin can manage users

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories

- [x] T062 [P] Update README and quickstart.md
- [x] T063 Security review note in quickstart
- [x] T064 Add unit tests for critical services
- [ ] T065 Run full quickstart flow: backend + frontend + DB + storage; validate create meeting, scan, record, summary, download report — **procédure** : [scripts/validate-quickstart.md](../../scripts/validate-quickstart.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3–9 (User Stories)**: Depend on Phase 2; can proceed in priority order (US1→US2→…→US7) or in parallel if staffed
- **Phase 10 (Polish)**: Depends on completion of desired user stories

### User Story Dependencies

- **US1**: After Foundational only; no dependency on other stories
- **US2**: Depends on US1 (meetings and QR exist)
- **US3**: Depends on US1 (meeting exists)
- **US4**: Depends on US3 (transcription exists)
- **US5**: Depends on US1 (meetings list)
- **US6**: Depends on US1, US2, US4 (meetings, scan, summary)
- **US7**: Depends on Foundational (User and auth); independent of US1–US6

### Within Each User Story

- Contract tests before or in parallel with implementation
- Models/entities before services; services before routes
- Backend routes before frontend/mobile UI

### Parallel Opportunities

- T005 (lint/format), T008 (User entity) can run in parallel within Phase 2
- T015–T016 (US1 tests), T017–T018 (US1 models) in parallel
- T026–T027 (US2 tests), T028 (Attendance model) in parallel
- T058 (Admin middleware) and T059 (users API) can overlap with other US7 tasks

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup  
2. Complete Phase 2: Foundational  
3. Complete Phase 3: User Story 1  
4. **STOP and VALIDATE**: Create meeting, add participants, view QR, edit/delete  
5. Deploy/demo if ready  

### Incremental Delivery

1. Setup + Foundational → foundation ready  
2. US1 → MVP (meetings + QR)  
3. US2 → Attendance by scan  
4. US3 → Recording + transcription  
5. US4 → Summary + email + PDF/Word  
6. US5 → Search/filters  
7. US6 → Mobile parity + offline sync  
8. US7 → Admin user management  

### Parallel Team Strategy

- After Foundational: Developer A (US1), Developer B (US2/US3), Developer C (US6 mobile)  
- US4 after US3; US6 can start once US1/US2 available on API  

---

## Notes

- [P] = different files, no ordering dependency within phase
- [USn] maps task to user story for traceability
- Each user story is independently testable per spec acceptance scenarios
- Commit after each task or logical group; validate at checkpoints
