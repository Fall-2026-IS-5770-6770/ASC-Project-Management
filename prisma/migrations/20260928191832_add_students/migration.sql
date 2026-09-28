-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "major" TEXT,
    "graduationDate" DATE,
    "resumeUrl" TEXT,
    "minHoursPerWeek" DOUBLE PRECISION,
    "maxHoursPerWeek" DOUBLE PRECISION,
    "workApprovalStatus" TEXT NOT NULL,
    "availability" TEXT,
    "preferredProjectTypeId" INTEGER,
    "audit" JSONB,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StudentSkills" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StudentSkills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_personId_key" ON "Student"("personId");

-- CreateIndex
CREATE INDEX "_StudentSkills_B_index" ON "_StudentSkills"("B");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_preferredProjectTypeId_fkey" FOREIGN KEY ("preferredProjectTypeId") REFERENCES "ProjectType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentSkills" ADD CONSTRAINT "_StudentSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentSkills" ADD CONSTRAINT "_StudentSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
