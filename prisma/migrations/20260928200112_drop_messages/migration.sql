-- Issue #77: messages now live in MongoDB.
-- Copy them there first with `node prisma/move-messages-to-mongo.js`,
-- because this drops the Postgres table and everything in it.

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_channelId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderPersonId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_threadId_fkey";

-- DropTable
DROP TABLE "Message";

