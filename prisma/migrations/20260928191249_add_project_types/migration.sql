-- CreateTable
CREATE TABLE "ProjectType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "typicalDurationWeeks" INTEGER,
    "typicalDeliverables" TEXT[],
    "audit" JSONB,

    CONSTRAINT "ProjectType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectTypeSkills" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProjectTypeSkills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectType_name_key" ON "ProjectType"("name");

-- CreateIndex
CREATE INDEX "_ProjectTypeSkills_B_index" ON "_ProjectTypeSkills"("B");

-- AddForeignKey
ALTER TABLE "_ProjectTypeSkills" ADD CONSTRAINT "_ProjectTypeSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "ProjectType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectTypeSkills" ADD CONSTRAINT "_ProjectTypeSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
