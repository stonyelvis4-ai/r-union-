-- CreateTable
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

-- CreateTable
CREATE TABLE "Transcription" (
    "id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "recording_id" TEXT,
    "full_text" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transcription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AudioRecording" ADD CONSTRAINT "AudioRecording_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_recording_id_fkey" FOREIGN KEY ("recording_id") REFERENCES "AudioRecording"("id") ON DELETE SET NULL ON UPDATE CASCADE;
