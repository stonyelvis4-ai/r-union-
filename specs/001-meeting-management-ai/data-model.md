# Data Model: Smart Meeting Management

**Feature**: 001-meeting-management-ai  
**Source**: spec.md Key Entities + FR validation rules

---

## Entities Overview

| Entity         | Purpose |
|----------------|---------|
| User           | Platform identity; auth; role (Admin, Organizer, Participant) |
| Meeting        | Reunion: title, date, time, location, agenda, status, owner, QR identifier |
| Participant    | Email (and optional name) linked to a meeting; no account required |
| Attendance     | One record per scan: meeting, scan time, optional identity |
| AudioRecording | Reference to stored audio file, meeting, duration, metadata |
| Transcription  | Meeting, full text, status (pending/complete/failed), source recording |
| Summary        | Meeting report: structured sections, generation time |

---

## 1. User

- **id**: unique identifier (UUID or bigint)
- **email**: string, unique, not null
- **name**: string, optional
- **passwordHash**: string, not null (never expose)
- **role**: enum `Admin | Organizer | Participant`, not null
- **isActive**: boolean, default true
- **createdAt**, **updatedAt**: timestamps

**Validation**: Email format; role in allowed set; password strength at registration.  
**Uniqueness**: email unique among active users.  
**Lifecycle**: Soft-deactivate (isActive = false) per FR-024; deactivated users cannot log in.

---

## 2. Meeting

- **id**: unique identifier
- **title**: string, not null
- **date**: date
- **time**: time (or combined datetime)
- **location**: string, optional
- **agenda**: text, optional
- **status**: enum e.g. `draft | scheduled | completed | cancelled`
- **ownerId**: FK → User (Organizer), not null
- **qrToken**: string, unique, not null (encoded in QR; stable for meeting lifecycle)
- **createdAt**, **updatedAt**: timestamps

**Validation**: Title non-empty; date/time valid; owner must be Organizer.  
**Relations**: One owner (User); many Participants; many Attendances; 0..1 AudioRecording; 0..1 Transcription; 0..1 Summary.  
**QR**: qrToken is generated on create and does not change on edit (spec: QR remains valid for same meeting).

---

## 3. Participant

- **id**: unique identifier
- **meetingId**: FK → Meeting, not null
- **email**: string, not null
- **displayName**: string, optional
- **createdAt**: timestamp

**Validation**: Email format; meeting exists.  
**Uniqueness**: (meetingId, email) unique to avoid duplicate invites.  
**Note**: No FK to User; invitees do not require a platform account (spec clarification).

---

## 4. Attendance

- **id**: unique identifier
- **meetingId**: FK → Meeting, not null
- **scannedAt**: timestamp, not null
- **userId**: FK → User, optional (null when scanner not logged in)
- **attendeeName**: string, optional (when not logged in or as override)
- **attendeeEmail**: string, optional (optional identifier when not logged in)

**Validation**: meetingId exists; at least one of (userId, attendeeName, attendeeEmail) or allow all null for anonymous.  
**Uniqueness**: Idempotent per (meetingId, userId) when userId present; when userId null, allow multiple anonymous rows or one per scan depending on product (spec allows “anonymous or optional identifier”).  
**Lifecycle**: Created on QR scan (or on sync from mobile queue).

---

## 5. AudioRecording

- **id**: unique identifier
- **meetingId**: FK → Meeting, not null
- **storageKey**: string, not null (path or key in cloud storage)
- **storageUrl**: string, optional (signed or permanent URL for processing)
- **durationSeconds**: number, optional
- **createdAt**: timestamp
- **status**: enum e.g. `uploading | ready | processing | failed`, optional

**Validation**: meetingId exists; storageKey non-empty.  
**Lifecycle**: Created when organizer stops recording and upload completes; “ready” when available for transcription job.

---

## 6. Transcription

- **id**: unique identifier
- **meetingId**: FK → Meeting, not null
- **recordingId**: FK → AudioRecording, optional
- **fullText**: text, nullable until complete
- **status**: enum `pending | complete | failed`, not null
- **createdAt**, **updatedAt**: timestamps

**Validation**: meetingId exists; status in allowed set.  
**Lifecycle**: Created when recording is ready (or when transcription job is enqueued); updated when speech-to-text returns; “complete” triggers automatic summary generation (spec).

---

## 7. Summary

- **id**: unique identifier
- **meetingId**: FK → Meeting, not null
- **title**: string (meeting title snapshot)
- **meetingDate**: date
- **participantsText**: text or structured (list of participants/emails)
- **discussionSummary**: text
- **keyDecisions**: text or JSON array
- **actionItems**: text or JSON array
- **responsiblePersons**: text or JSON array
- **nextSteps**: text
- **generatedAt**: timestamp
- **version**: integer, optional (if multiple reports per meeting)

**Validation**: meetingId exists; required sections non-null when generated.  
**Lifecycle**: Created automatically when transcription status becomes “complete”; then email distribution and PDF/Word export.

---

## Relationships (ER Summary)

- **User** 1 — * Meeting (owner)
- **Meeting** 1 — * Participant
- **Meeting** 1 — * Attendance
- **Meeting** 1 — 0..1 AudioRecording
- **Meeting** 1 — 0..1 Transcription
- **Meeting** 1 — 0..1 Summary
- **User** 0..1 — * Attendance (when logged in)
- **AudioRecording** 1 — 0..1 Transcription (source)

---

## Indexes (Recommendations)

- User: email (unique), role, isActive
- Meeting: ownerId, date, status, qrToken (unique)
- Participant: meetingId, (meetingId, email) unique
- Attendance: meetingId, userId, scannedAt
- Transcription: meetingId, status
- Summary: meetingId

---

## State Transitions

- **Meeting**: draft → scheduled → completed | cancelled
- **Recording**: uploading → ready (optional: processing, failed)
- **Transcription**: pending → complete | failed
- **Summary**: created once transcription is complete; optional versioning on regenerate
