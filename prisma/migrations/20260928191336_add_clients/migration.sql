-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contactPersonName" TEXT,
    "contactEmail" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "billingEmail" TEXT,
    "billingTerms" TEXT,
    "audit" JSONB,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_name_key" ON "Client"("name");
