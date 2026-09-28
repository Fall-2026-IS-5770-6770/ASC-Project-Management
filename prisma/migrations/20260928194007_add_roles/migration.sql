-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scope" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationRole" (
    "id" SERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "roleName" TEXT NOT NULL,
    "audit" JSONB,

    CONSTRAINT "OrganizationRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationRole_personId_roleName_key" ON "OrganizationRole"("personId", "roleName");

-- The five roles from the README. Inserted here, before the foreign key below,
-- because existing project assignments already use these names.
INSERT INTO "Role" ("id", "name", "description", "scope") VALUES
    (1, 'ASC Administrator', 'Organization-wide access: creates and manages projects, users, statuses, memberships, and settings.', 'organization'),
    (2, 'Project Manager', 'Coordinates a project: its members, tasks, boards, channels, and status.', 'project'),
    (3, 'Faculty Mentor', 'Oversees and advises a project: follows its activity, joins its channels, and reviews its tasks.', 'project'),
    (4, 'Student', 'Works on a project: creates and updates tasks, joins its channels, and uploads resources.', 'project'),
    (5, 'Sponsor', 'Outside stakeholder with read-only access to their project''s board, requirements, and documents.', 'project');
SELECT setval(pg_get_serial_sequence('"Role"', 'id'), 6, false);

-- AddForeignKey
ALTER TABLE "ProjectPerson" ADD CONSTRAINT "ProjectPerson_role_fkey" FOREIGN KEY ("role") REFERENCES "Role"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationRole" ADD CONSTRAINT "OrganizationRole_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationRole" ADD CONSTRAINT "OrganizationRole_roleName_fkey" FOREIGN KEY ("roleName") REFERENCES "Role"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
