-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "clientId" INTEGER NOT NULL,
    "mainBoardStatusId" INTEGER NOT NULL,
    "projectManagerId" INTEGER,
    "startDate" DATE,
    "midpointDate" DATE,
    "endDate" DATE,
    "budget" DECIMAL(12,2),
    "estimatedHours" DOUBLE PRECISION,
    "notes" TEXT,
    "workspaceInitializedAt" TIMESTAMP(3),
    "audit" JSONB,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_mainBoardStatusId_fkey" FOREIGN KEY ("mainBoardStatusId") REFERENCES "MainBoardStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectManagerId_fkey" FOREIGN KEY ("projectManagerId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
