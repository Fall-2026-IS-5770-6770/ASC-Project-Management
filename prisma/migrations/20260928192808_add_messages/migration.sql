-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "threadId" INTEGER NOT NULL,
    "channelId" INTEGER NOT NULL,
    "senderPersonId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3),
    "editedAt" TIMESTAMP(3),
    "audit" JSONB,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderPersonId_fkey" FOREIGN KEY ("senderPersonId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
