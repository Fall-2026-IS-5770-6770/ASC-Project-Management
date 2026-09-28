-- CreateTable
CREATE TABLE "MainBoardStatus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER,
    "audit" JSONB,

    CONSTRAINT "MainBoardStatus_pkey" PRIMARY KEY ("id")
);
