-- CreateTable
CREATE TABLE "Thread" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdByPersonId" INTEGER,
    "createdAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),
    "audit" JSONB,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_createdByPersonId_fkey" FOREIGN KEY ("createdByPersonId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
