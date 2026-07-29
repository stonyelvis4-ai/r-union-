-- Add unique constraints for one-to-one relations
CREATE UNIQUE INDEX IF NOT EXISTS "Transcription_meeting_id_key" ON "Transcription"("meeting_id");
CREATE UNIQUE INDEX IF NOT EXISTS "Transcription_recording_id_key" ON "Transcription"("recording_id");
