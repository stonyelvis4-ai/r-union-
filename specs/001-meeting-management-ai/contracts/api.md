# API Contract: Smart Meeting Management

**Feature**: 001-meeting-management-ai  
**Audience**: Backend implementers, frontend/mobile consumers  
**Base path**: `/api` (or `/api/v1`). All endpoints require `Content-Type: application/json` unless file upload.

**Authentication**: Bearer JWT in `Authorization` header. Exceptions: `POST /api/attendance/scan` (and optionally `GET /api/meetings/:id/qr`) may allow unauthenticated access when payload contains only meeting token (per spec: anyone with QR can scan).

---

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register: `{ email, password, name?, role? }` → `{ user, token }` |
| POST | /api/auth/login | No | Login: `{ email, password }` → `{ user, token }` |
| POST | /api/auth/logout | Yes | Invalidate token (optional) |
| GET  | /api/auth/me | Yes | Current user |

---

## Users (Admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | /api/users | Admin | List users (filter, pagination) |
| POST   | /api/users | Admin | Create user: `{ email, password, name?, role }` |
| GET    | /api/users/:id | Admin | Get user |
| PATCH  | /api/users/:id | Admin | Update (name, role, etc.); set active/inactive |
| DELETE | /api/users/:id | Admin | Deactivate (soft delete) |

---

## Meetings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | /api/meetings | Organizer+ | List meetings (query: dateFrom, dateTo, organizerId, search) |
| POST   | /api/meetings | Organizer | Create: `{ title, date, time, location?, agenda?, participantEmails[] }` → meeting + qrToken/QR URL |
| GET    | /api/meetings/:id | Organizer+ or Participant | Get meeting detail (with participants, attendance, recording/transcription/summary status) |
| GET    | /api/meetings/:id/qr | No (or token) | Get QR payload or image for meeting (by id or by qrToken) — allow unauthenticated if qrToken in query |
| PATCH  | /api/meetings/:id | Organizer (owner) | Update meeting |
| DELETE | /api/meetings/:id | Organizer (owner) | Delete meeting |

**Response shape (meeting)**: `id`, `title`, `date`, `time`, `location`, `agenda`, `status`, `ownerId`, `qrToken`, `participants[]`, `attendanceCount`, `hasRecording`, `transcriptionStatus`, `hasSummary`, `createdAt`, `updatedAt`.

---

## Participants

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | /api/meetings/:meetingId/participants | Organizer+ | List participants |
| POST   | /api/meetings/:meetingId/participants | Organizer | Add: `{ email, displayName? }` |
| DELETE | /api/meetings/:meetingId/participants/:id | Organizer | Remove participant |

---

## Attendance

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST   | /api/attendance/scan | No (or Yes) | Record attendance: body `{ meetingId or qrToken }`; if authenticated, associate userId; else optional name/email or anonymous. Idempotent when same user + meeting. Returns `{ success, alreadyRecorded?, attendance }`. |
| GET    | /api/meetings/:id/attendance | Organizer+ | List attendance for meeting |

---

## Recording

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST   | /api/meetings/:id/recording/start | Organizer | Start recording → `{ recordingId, status }` |
| POST   | /api/meetings/:id/recording/pause | Organizer | Pause |
| POST   | /api/meetings/:id/recording/stop | Organizer | Stop and upload audio: body multipart or URL → `{ recordingId }`; backend stores file in cloud and creates AudioRecording |
| GET    | /api/meetings/:id/recording | Organizer+ | Get recording metadata and status |

---

## Transcription

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | /api/meetings/:id/transcription | Organizer+ | Get transcription (fullText, status); trigger or poll until complete |
| POST   | /api/meetings/:id/transcription/retry | Organizer | Retry if failed (optional) |

**Note**: Backend triggers transcription job when recording is ready; report is generated automatically when transcription is complete (no dedicated “generate report” endpoint required for normal flow).

---

## Summary & Report

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | /api/meetings/:id/summary | Organizer+ / Participant | Get summary (structured sections) |
| GET    | /api/meetings/:id/report | Organizer+ / Participant | Download report: query `?format=pdf|docx` → file stream or redirect to signed URL |
| POST   | /api/meetings/:id/report/send | Organizer (optional) | Re-send report email to participants (optional; auto-send on generation) |

---

## Search

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET    | /api/meetings/search | Organizer+ | Query: `q`, `dateFrom`, `dateTo`, `organizerId`, `searchInTranscript=true` → list of meetings matching criteria (SC-005: results in <3s) |

---

## Mobile Offline Sync

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST   | /api/attendance/sync | Yes | Body: `{ items: [ { meetingId or qrToken, scannedAt } ] }` — process queued scans from mobile; return success/fail per item |

---

## Error Responses

- `400` Bad Request: validation errors; body `{ errors: [{ field, message }] }`
- `401` Unauthorized: missing or invalid token
- `403` Forbidden: valid token but insufficient role
- `404` Not Found: resource missing
- `409` Conflict: e.g. duplicate participant email
- `500` Server error: generic message; no stack in production

---

## Versioning

API prefix `/api` or `/api/v1`; future breaking changes introduce `/api/v2`. Non-breaking additions (new optional fields, new endpoints) do not require version bump.
