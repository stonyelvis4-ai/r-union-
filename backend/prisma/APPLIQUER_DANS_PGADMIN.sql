-- ============================================================
-- SmartReunion - Structure complète de la base (à exécuter dans pgAdmin)
-- Base cible : SMARTREUNION (schéma public)
-- Exécuter ce script en entier dans l'ordre (Query Tool de pgAdmin).
-- ============================================================

-- 1. Enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ORGANIZER', 'PARTICIPANT');
CREATE TYPE "MeetingStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- 2. Table User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PARTICIPANT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- 3. Table Meeting
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT,
    "agenda" TEXT,
    "status" "MeetingStatus" NOT NULL DEFAULT 'DRAFT',
    "owner_id" TEXT NOT NULL,
    "qr_token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Meeting_qr_token_key" ON "Meeting"("qr_token");
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Table Participant
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Participant_meeting_id_email_key" ON "Participant"("meeting_id", "email");
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Table Attendance
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "attendee_name" TEXT,
    "attendee_email" TEXT,
    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. Table AudioRecording
CREATE TABLE "AudioRecording" (
    "id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "storage_url" TEXT,
    "duration_seconds" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'uploading',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AudioRecording_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "AudioRecording" ADD CONSTRAINT "AudioRecording_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. Table Transcription
CREATE TABLE "Transcription" (
    "id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "recording_id" TEXT,
    "full_text" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transcription_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Transcription_meeting_id_key" ON "Transcription"("meeting_id");
CREATE UNIQUE INDEX "Transcription_recording_id_key" ON "Transcription"("recording_id");
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_recording_id_fkey" FOREIGN KEY ("recording_id") REFERENCES "AudioRecording"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 8. Table Summary
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "meeting_date" DATE NOT NULL,
    "participants_text" TEXT NOT NULL,
    "discussion_summary" TEXT NOT NULL,
    "key_decisions" TEXT NOT NULL,
    "action_items" TEXT NOT NULL,
    "responsible_persons" TEXT NOT NULL,
    "next_steps" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Summary_meeting_id_key" ON "Summary"("meeting_id");
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Fin du script
