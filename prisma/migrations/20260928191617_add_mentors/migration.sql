-- CreateTable
CREATE TABLE "Mentor" (
    "id" SERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "department" TEXT,
    "availability" TEXT,
    "maxProjectLoad" INTEGER,
    "preferredProjectTypeId" INTEGER,
    "audit" JSONB,

    CONSTRAINT "Mentor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MentorSkills" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MentorSkills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mentor_personId_key" ON "Mentor"("personId");

-- CreateIndex
CREATE INDEX "_MentorSkills_B_index" ON "_MentorSkills"("B");

-- AddForeignKey
ALTER TABLE "Mentor" ADD CONSTRAINT "Mentor_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentor" ADD CONSTRAINT "Mentor_preferredProjectTypeId_fkey" FOREIGN KEY ("preferredProjectTypeId") REFERENCES "ProjectType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MentorSkills" ADD CONSTRAINT "_MentorSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Mentor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MentorSkills" ADD CONSTRAINT "_MentorSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
