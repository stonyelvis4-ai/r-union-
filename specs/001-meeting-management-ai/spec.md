# Feature Specification: Smart Meeting Management (Web & Mobile)

**Feature Branch**: `001-meeting-management-ai`  
**Created**: 2025-03-06  
**Status**: Draft  
**Input**: Product specification for an AI-powered meeting management application on web and mobile: organize meetings, track attendance via QR, record and transcribe audio, generate AI summaries, distribute reports.

---

## Product Overview

The application is a smart meeting management system designed to help organizations:

- Organize meetings (create, schedule, agenda, participants)
- Track attendance via QR codes
- Record discussions and store audio securely
- Automatically transcribe audio using AI speech-to-text
- Generate AI-powered structured summaries (decisions, action items, responsible persons, next steps)
- Distribute meeting reports to participants (email, PDF or Word download)

The system MUST be usable on both web and mobile devices with a consistent set of core capabilities adapted to each platform.

---

## Clarifications

### Session 2025-03-06

- Q: When is the meeting report generated—automatically when transcription is ready, only when the organizer explicitly triggers it, or configurable? → A: Automatically as soon as transcription is ready.
- Q: Who is allowed to scan the meeting QR code to record attendance? → A: Anyone with the link/QR (including unauthenticated users).
- Q: Can participants be only existing platform users, or also email-invited guests without an account? → A: Email only (guests, no account required).
- Q: When the participant is offline at scan time, should the app queue the scan and sync when online, or require connectivity? → A: Queue the scan and sync when back online.
- Q: Should users be able to download the report as PDF only, or also as Word? → A: PDF and Word.

---

## Target Users

| Role | Responsibilities |
|------|------------------|
| **Admin** | Manages the platform; manages users (create, edit, deactivate, assign roles). |
| **Organizer** | Creates meetings; manages participants; records meetings; triggers or approves report generation; distributes reports. |
| **Participant** | Receives meeting invitation by email (no platform account required); scans QR code to confirm attendance; receives and reads meeting summaries (e.g. via email link or guest access). |

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Organizer Creates a Meeting and Invites Participants (Priority: P1)

An organizer creates a meeting with title, date, time, location, and agenda, then invites participants by email (invitees do not need a platform account). The system generates a unique QR code for the meeting. The organizer can view the meeting in a dashboard and edit or delete it before it occurs.

**Why this priority**: Core value: no meetings means no use for recording, attendance, or summaries.

**Independent Test**: Create a meeting, add agenda and participants, verify it appears in the dashboard and a unique QR code is available. Edit and delete the meeting and verify changes persist.

**Acceptance Scenarios**:

1. **Given** the user is an Organizer, **When** they create a meeting with title, date, time, location, and agenda, **Then** the meeting is saved and a unique QR code is generated for it.
2. **Given** a meeting exists, **When** the organizer adds participant email addresses, **Then** those participants are invited by email and associated with the meeting (no platform account required).
3. **Given** a meeting exists, **When** the organizer edits title or date, **Then** the meeting is updated and the QR code remains valid for the same meeting.
4. **Given** a meeting exists, **When** the organizer deletes the meeting, **Then** the meeting and its QR code are no longer valid for attendance.

---

### User Story 2 - Participant Marks Attendance by Scanning QR Code (Priority: P2)

A participant or any person with access to the meeting (e.g. via invitation or link) can scan the meeting’s QR code from a mobile app or web. The system records attendance with meeting ID and scan time; when the user is logged in, their identity is associated with the record; when not logged in, the system records the scan (attendee identification, e.g. optional name/email, is implementation-defined).

**Why this priority**: Attendance is a differentiator and required for reports that list “Participants”.

**Independent Test**: As a participant, scan the meeting QR code from the mobile app; verify attendance is recorded with name, meeting ID, and timestamp. View the meeting in “my meetings” and see attendance status.

**Acceptance Scenarios**:

1. **Given** a meeting has a generated QR code, **When** anyone scans the QR code (from mobile app or web, logged in or not), **Then** the system records attendance with meeting ID and scan time, and associates identity when the user is logged in.
2. **Given** the user is logged in when they scan the QR code, **When** they scan, **Then** their user identity is associated with the attendance record.
3. **Given** attendance was recorded, **When** the organizer or admin views the meeting, **Then** they see the list of attendees with scan time (and identity when available).

---

### User Story 3 - Organizer Records Meeting and Obtains Transcription (Priority: P3)

During the meeting, the organizer starts recording. They can pause and resume, then stop recording. The audio is saved securely. After the meeting, the system sends the audio to an AI speech-to-text service and stores the resulting transcription linked to the meeting.

**Why this priority**: Recording and transcription are the foundation for AI summaries.

**Independent Test**: Start, pause, stop a recording; verify audio is stored and a transcription job is triggered; verify transcription text is stored and viewable for the meeting.

**Acceptance Scenarios**:

1. **Given** the user is the meeting organizer, **When** they start recording, **Then** audio capture begins and the system indicates recording is active.
2. **Given** recording is active, **When** the organizer pauses, **Then** recording pauses and can be resumed without creating a separate meeting.
3. **Given** recording is paused or active, **When** the organizer stops recording, **Then** the audio file is saved securely and associated with the meeting.
4. **Given** a meeting has a saved audio recording, **When** the system processes it, **Then** the audio is sent to an AI speech-to-text service and the resulting transcription is stored and linked to the meeting.

---

### User Story 4 - System Generates and Distributes Meeting Report (Priority: P4)

After transcription is available, the system **automatically** generates a structured meeting report (summary) including: meeting title, date, participants, discussion summary, key decisions, action items, responsible persons, and next steps. The report is sent to all participants by email, and users can download it as PDF or Word.

**Why this priority**: Delivers the main business value of “AI-powered summaries” and distribution.

**Independent Test**: Trigger report generation for a meeting that has transcription and attendance; verify report contains the required sections; verify email is sent to participants and PDF download is available.

**Acceptance Scenarios**:

1. **Given** a meeting has transcription and attendance data, **When** the transcription becomes available, **Then** the system automatically generates a structured report with: Meeting Title, Meeting Date, Participants, Discussion Summary, Key Decisions, Action Items, Responsible Persons, Next Steps.
2. **Given** a report is generated, **When** distribution is performed, **Then** all participants receive the meeting report by email.
3. **Given** a report exists, **When** a user (organizer or participant) requests download, **Then** the user can download the report as PDF or Word.

---

### User Story 5 - Users Search and Filter Meetings (Priority: P5)

Users can search meetings by text, filter by date range, and filter by organizer. Users with access to meeting content can search inside meeting transcripts.

**Why this priority**: Essential for usability at scale without changing core flows.

**Independent Test**: Create several meetings with different organizers and dates; search by title, filter by date and organizer; search for a phrase that appears in a transcript; verify correct meetings are returned.

**Acceptance Scenarios**:

1. **Given** the user has access to a list of meetings, **When** they search by text (e.g. title), **Then** only meetings matching the search criteria are shown.
2. **Given** the user applies filters, **When** they filter by date range and by organizer, **Then** the list shows only meetings in that range and (optionally) organized by that organizer.
3. **Given** the user has permission to view meeting content, **When** they search for text that appears in a meeting transcript, **Then** that meeting appears in search results.

---

### User Story 6 - Mobile: Login, View Meetings, Scan QR, Read Summaries (Priority: P6)

On the mobile application, users can log in, view their meetings (upcoming and past), scan a meeting’s QR code to confirm attendance, and read meeting summaries.

**Why this priority**: Parity for mobile for the most common participant and organizer actions.

**Independent Test**: Log in on mobile, view meeting list, scan QR for a meeting and confirm attendance, open a meeting summary and read it.

**Acceptance Scenarios**:

1. **Given** the user has credentials, **When** they open the mobile app and log in, **Then** they are authenticated and see their dashboard or meeting list.
2. **Given** the user is logged in, **When** they open the meetings view, **Then** they see upcoming and past meetings they are part of.
3. **Given** the user is on mobile, **When** they scan a meeting QR code, **Then** attendance is recorded (same as User Story 2) and they receive confirmation.
4. **Given** a meeting has a generated summary, **When** the user opens that meeting on mobile, **Then** they can read the full meeting summary (title, date, participants, discussion summary, decisions, action items, responsible persons, next steps).

---

### User Story 7 - Admin Manages Platform and Users (Priority: P7)

An admin can manage the platform (e.g. view system health or usage) and manage users: create users, assign roles (Admin, Organizer, Participant), edit user details, and deactivate users.

**Why this priority**: Required for multi-tenant or organizational use but not needed for the first end-to-end flow.

**Independent Test**: As admin, create a user, assign Organizer role, edit the user, deactivate the user; verify only admins can perform these actions.

**Acceptance Scenarios**:

1. **Given** the user is Admin, **When** they create a new user with email and role, **Then** the user is created and can log in with the assigned role.
2. **Given** a user exists, **When** Admin edits their role or details, **Then** changes are saved and apply on next login.
3. **Given** a user exists, **When** Admin deactivates the user, **Then** the user can no longer log in and does not appear in active participant lists for new meetings.

---

### Edge Cases

- **QR code scanned multiple times by same participant**: System records one attendance per participant per meeting (idempotent scan) or clearly indicates “already marked” and does not duplicate.
- **Recording fails (storage full, permission, device)**: User is notified and can retry; no partial recording is presented as “complete”.
- **Transcription service unavailable or returns error**: System retries according to policy; user can see “transcription pending” or “failed” and retry later.
- **Report generation before transcription ready**: System either queues report generation until transcription exists or clearly indicates that report is not yet available and when it might be.
- **Participant has no email**: Report distribution skips that participant or uses an alternative channel if specified; requirement is “send to all participants” where contact info exists.
- **Search with no results**: Empty state message; no error.
- **Mobile offline**: When the user is offline, the app MUST queue the QR scan and sync attendance when back online; the user receives clear feedback (e.g. “Attendance will be recorded when you’re back online”).

---

## Requirements *(mandatory)*

### Functional Requirements

**Meeting management**

- **FR-001**: System MUST allow Organizers to create a meeting with title, date, time, location, and agenda.
- **FR-002**: System MUST allow Organizers to invite participants to a meeting by email; invitees do not need a platform account.
- **FR-003**: System MUST allow Organizers to edit and delete meetings they own.
- **FR-004**: System MUST display upcoming and past meetings and meeting status in a dashboard.

**QR attendance**

- **FR-005**: System MUST generate a unique QR code per meeting when the meeting is created.
- **FR-006**: System MUST allow anyone with the meeting QR code to scan it (via mobile app or web, authenticated or not) to record attendance.
- **FR-007**: System MUST store attendance with meeting ID and scan time; when the user is logged in, their identity (user id or participant name) MUST be associated; when not logged in, the system MAY record an anonymous scan or capture an optional identifier (e.g. name/email) as implementation allows.

**Recording**

- **FR-008**: System MUST allow the meeting Organizer to start, pause, and stop recording during a meeting.
- **FR-009**: System MUST save the audio recording securely and associate it with the meeting.

**Transcription**

- **FR-010**: System MUST send the meeting audio to an AI speech-to-text service and store the resulting transcription linked to the meeting.
- **FR-011**: System MUST store the full transcription text in the database and make it available for display and search.

**AI summary**

- **FR-012**: System MUST generate a structured meeting report automatically when the meeting’s transcription is available, including: Meeting Title, Meeting Date, Participants, Discussion Summary, Key Decisions, Action Items, Responsible Persons, Next Steps.
- **FR-013**: Report generation MUST use the meeting’s transcription (and optionally attendance) as input.

**Report distribution**

- **FR-014**: System MUST send the meeting report to all participants via email once the report is generated.
- **FR-015**: System MUST allow users to download the meeting report as PDF or Word.

**Search and history**

- **FR-016**: Users MUST be able to search meetings (e.g. by title or keyword).
- **FR-017**: Users MUST be able to filter meetings by date and by organizer.
- **FR-018**: Users with access to meeting content MUST be able to search inside meeting transcripts.

**Mobile**

- **FR-019**: Mobile application MUST allow users to log in, view meetings, scan QR codes to confirm attendance, and read meeting summaries. When offline, the app MUST queue QR scans and sync attendance when connectivity is restored.

**Data and security**

- **FR-020**: System MUST store and manage entities: Users, Meetings, Participants, Attendance, Audio Recordings, Transcriptions, Summaries.
- **FR-021**: System MUST enforce secure authentication and encrypted storage of passwords.
- **FR-022**: System MUST protect API endpoints so only authorized roles can perform allowed actions.
- **FR-023**: System MUST validate and sanitize user inputs to prevent common vulnerabilities.

**Admin**

- **FR-024**: System MUST allow Admin to manage users (create, edit, assign role, deactivate) and to manage the platform within the application’s scope.

### Key Entities

- **Users**: Identity (e.g. email, name), role (Admin, Organizer, Participant), authentication data, active/inactive state.
- **Meetings**: Title, date, time, location, agenda, status, owner (Organizer), unique identifier for QR, link to recording and summary.
- **Participants**: Association of one or more email addresses (and optional display name) to a Meeting; invitees do not require a platform account. May be extended with response status or link to User when an invitee later registers.
- **Attendance**: Meeting ID, scan timestamp; attendee identity (user id or name) when the scanner was logged in, otherwise optional identifier or anonymous per implementation.
- **Audio Recordings**: Reference to stored audio file, meeting ID, duration, creation time, storage metadata.
- **Transcriptions**: Meeting ID, full text of transcription, source recording reference, creation time, status (pending/complete/failed).
- **Summaries**: Meeting ID, structured content (title, date, participants, discussion summary, key decisions, action items, responsible persons, next steps), generation time, version if multiple reports.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An Organizer can create a meeting with agenda and participants and see a unique QR code in under two minutes.
- **SC-002**: A Participant can scan the meeting QR code and have attendance recorded in under 30 seconds from opening the app.
- **SC-003**: After the organizer stops recording, the system produces a viewable transcription for the meeting within a defined time window (e.g. within 10 minutes for a 1-hour meeting under normal load).
- **SC-004**: Once the report is generated, all participants receive the email with the report and can open or download the PDF or Word file without errors in at least 95% of cases.
- **SC-005**: Users can find a meeting by searching by title or by a phrase in the transcript, and results appear within 3 seconds under normal load.
- **SC-006**: The application is usable on web (desktop/tablet) and mobile (phones) with core flows (create meeting, scan QR, view summary) completable on both without blocking issues.
- **SC-007**: Page loads and list views complete in under 3 seconds under standard conditions; the system is designed to scale with more users and meetings without redesign.

---

## Assumptions

- **Authentication**: Email/password or standard organizational login; password reset and session management follow common practice. No specific SSO/OAuth requirement stated; can be clarified later if needed.
- **Roles**: Three roles (Admin, Organizer, Participant) are sufficient for the first release; permission model is role-based.
- **AI services**: A single AI speech-to-text service is used for transcription; a single AI or rule-based service is used for summary generation. Exact provider is an implementation choice.
- **Storage**: Audio is stored in a secure, durable cloud storage; exact retention period follows organizational or legal defaults unless specified.
- **Email**: Participants are invited by email only; report distribution sends the meeting report to those email addresses. Invalid or bouncing addresses are skipped with optional notification to the organizer.
- **Participant identity**: Participants are invited by email only; they do not need a platform account to be invited, to receive the report, or to scan the QR (attendance is then recorded as in FR-007).
- **Mobile**: “Mobile application” is a dedicated app (e.g. React Native/Expo) with parity for login, meeting list, QR scan, and summary reading; other features may appear first on web. Offline QR scans are queued and synced when back online.
- **Attendance**: Attendance can be recorded by anyone who scans the meeting QR code (authenticated or not). When logged in, user identity is stored with the attendance record; when not, the system may record an anonymous scan or optional identifier.
- **Report generation**: The meeting report is generated automatically as soon as the transcription is ready; no manual trigger by the organizer is required.
- **Future features**: Speaker identification, multilingual transcription, meeting analytics, calendar integration, and task management from action items are out of scope for this specification but the data model and architecture should not block their addition later.

---

## Future Features (Out of Scope)

The system SHOULD be designed to support later addition of:

- Speaker identification in recordings/transcripts
- Multilingual transcription
- Meeting analytics (e.g. time per topic, participation metrics)
- Integration with calendar systems
- Task management created from meeting action items and responsible persons

These are not part of the current acceptance criteria or functional requirements.

---

## User Interface, Security, and Performance (Summary)

- **UI**: Interface MUST be modern, simple, responsive, and mobile-friendly; use dashboards, cards, and clear layouts.
- **Security**: Secure authentication, encrypted passwords, protected API endpoints, input validation (see FR-021–FR-023).
- **Performance**: Fast loading pages, efficient database queries, scalable backend (see SC-007).
