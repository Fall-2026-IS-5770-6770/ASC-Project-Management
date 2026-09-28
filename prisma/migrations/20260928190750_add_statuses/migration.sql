-- CreateTable
CREATE TABLE "Status" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER,
    "audit" JSONB,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);
