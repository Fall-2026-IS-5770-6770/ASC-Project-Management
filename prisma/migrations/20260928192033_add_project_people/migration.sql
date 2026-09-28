-- CreateTable
CREATE TABLE "ProjectPerson" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "personId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "startDate" DATE,
    "endDate" DATE,
    "assignedHours" DOUBLE PRECISION,
    "approvalStatus" TEXT,
    "status" TEXT,
    "audit" JSONB,

    CONSTRAINT "ProjectPerson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectPerson_projectId_personId_role_key" ON "ProjectPerson"("projectId", "personId", "role");

-- AddForeignKey
ALTER TABLE "ProjectPerson" ADD CONSTRAINT "ProjectPerson_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPerson" ADD CONSTRAINT "ProjectPerson_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
