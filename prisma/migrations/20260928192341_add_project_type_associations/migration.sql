-- CreateTable
CREATE TABLE "ProjectProjectType" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "projectTypeId" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "audit" JSONB,

    CONSTRAINT "ProjectProjectType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectProjectType_projectId_projectTypeId_key" ON "ProjectProjectType"("projectId", "projectTypeId");

-- AddForeignKey
ALTER TABLE "ProjectProjectType" ADD CONSTRAINT "ProjectProjectType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectProjectType" ADD CONSTRAINT "ProjectProjectType_projectTypeId_fkey" FOREIGN KEY ("projectTypeId") REFERENCES "ProjectType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
