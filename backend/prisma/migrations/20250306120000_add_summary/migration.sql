-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "Summary_meeting_id_key" ON "Summary"("meeting_id");

-- AddForeignKey
ALTER TABLE "Summary" ADD CONSTRAINT "Summary_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
