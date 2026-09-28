-- CreateTable
CREATE TABLE "PersonSkill" (
    "id" SERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "proficiency" TEXT NOT NULL,
    "yearsExperience" DOUBLE PRECISION,
    "lastUsed" DATE,
    "audit" JSONB,

    CONSTRAINT "PersonSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonSkill_personId_skillId_key" ON "PersonSkill"("personId", "skillId");

-- AddForeignKey
ALTER TABLE "PersonSkill" ADD CONSTRAINT "PersonSkill_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonSkill" ADD CONSTRAINT "PersonSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
