# Handoff notes

Notes for whoever (human or Claude) picks this up next. The README is the
source of truth for scope; this file records what was built, how it's put
together, and what's left.

## Ground rules from the owner

- **Single file:** all routes, business logic, and database queries live in
  `index.js` (no MVC and no controllers). The only exceptions are Prisma's files
  (`prisma/`, `prisma.config.js`) and `docker-compose.yml`.
- **Git:** commit locally with one commit per ticket and the issue number in the
  message. Don't push, open PRs, or change anything on the remote.
- **Skip what doesn't fit:** a ticket that contradicts the README gets skipped,
  with the reason reported back.
- **Roles:** the README's five: ASC Administrator, Project Manager, Faculty
  Mentor, Student, Sponsor.
- **Sign-in:** dummy pages only; no real OAuth.
- **UX:** follow UX principles. The top bar should stay short (see "UX" below).

## Running it

```
docker compose up -d          # asc-postgres on 5433, asc-mongo on 27017
cp .env.example .env
npm install                   # also runs prisma generate
npm run db:migrate            # prisma migrate deploy + generate
npm run db:seed               # dummy data from data/ (Postgres + MongoDB)
npm run dev
```

Sign in at /signin with one of the dummy providers. Useful people:
- **Priya Raman** (`priya.raman@usu.edu`, Microsoft): ASC Administrator (seeded).
- **Ethan Caldwell** (`ethan.caldwell@usu.edu`): Project Manager on projects 3
  and 4, Faculty Mentor on project 1.
- **Maya Thompson** (`maya.thompson@usu.edu`): Student on project 1.
- **Rosa Delgado** (`rosa@cachefoodpantry.org`, Cognito): Sponsor on project 2.
  She was created during testing and isn't in the seed.

## How index.js is organized

These are the section markers (`// ===== NAME =====`), in order.

- **DATA:** each table is a `databaseTable("key")` proxy onto the current
  request's snapshot.
- **SESSIONS:**
  - express-session with an in-memory store; cookie settings are commented.
  - Each request's snapshot is loaded into AsyncLocalStorage (`requestContext`).
- **MONGODB:**
  - Mongoose `Message` and `Counter` models, the 16 log models, and
    `onChange()` listeners.
  - The server listens only after the Mongo connection attempt.
- **Middleware after MONGODB:**
  - flash messages;
  - the signed-in check (#123): it builds `context.user` from `rolesOf()`, then
    `limitSnapshotToUser()` trims the snapshot to what that user may see;
  - the org-page guard (`pageResource`).
- **DATABASE:** the Prisma client (Postgres adapter), `inTransaction` (with
  `afterCommit` and Mongo `onRollback`), fromDb/toDb, fromMongo/toMongo,
  `loadSnapshot`, and `saveQuietly`.
- **HTML HELPERS:** layout (`sendPage`), NAV, CSS, buttons, and modals.
- **RECORDS:** the `ENTITIES` registry is the heart of the app. Each resource
  declares its store, `model` (Prisma) or `mongo` (Mongoose), fields, validate,
  defaults, and hooks. It drives forms, parsing and validation, cascades and
  blocking deletes, the change history, and audit stamps.
- **PROJECT WORKSPACES:** moving a project into "In Progress" creates its board
  columns and #general channel, once only (idempotent). Also `rolesOf()`.
- **ACCESS:**
  - `PROJECT_ROLE_PERMISSIONS`, `can(action, projectId)`, and the `ACCESS`
    table with `allowed(entity, operation, record)`.
  - Viewing is enforced by trimming the snapshot. Writes are checked in
    handleCreate/Update/Delete, in the custom routes, and in the API.
- **RESOURCE PAGES:** shared list, detail, and edit page builders plus the POST
  handlers.
- **SIGN-IN:**
  - provider strategies (`registerAuthProvider`), dummy providers, and the
    `/auth/:provider/*` routes;
  - `resolvePerson` (linked account, then email, then create), `/signin`, and
    `/signout`.
- **ACTIVITY, PROJECTS, STATUSES, …, PEOPLE:** one section per resource.
- **ROLE MANAGEMENT:** `/admin/roles`.
- **REST API:** `registerApi()` under `/api/v1` (JSON; 400, 403, 404, 409).
- **ERRORS:** the 404 page and the error handler (writes to ErrorLog).

## Data

- **Postgres (Prisma 7, prisma-client-js generator):** every resource except
  messages, plus UserAccount, Role, and OrganizationRole. Migrations are
  numbered in `prisma/migrations`. The seed only fills in missing ids.
- **MongoDB (Mongoose):** messages (#77) and all the logs.
  - To move old Postgres messages: `npm run db:move-messages`, before running
    the drop_messages migration.
- **In memory only:** `changeHistory`, which backs `/activity` and resets on
  restart. The Mongo logs are the durable record.
- **Caution:** Prisma refuses `migrate reset` when it's run by an AI agent.
  Don't work around that; clean up test data by hand.

## Ticket status

- **Done:** #10, #15, #17, #19, #20–#57, #77–#150 (including sign-in and roles,
  #116–#131). Three small fix commits reference #20, #24, and #97.
- **Skipped:**
  - #58–#76: controllers, which the single-file rule excludes.
  - #151: deploy (each student deploys their own fork).
  - #158 and #167: personal contributor comments.
- **Not modeled** (no data or ticket): bills, milestones, meetings, approvals,
  and deliverables. There are no task comments either; the channels serve that
  purpose.

## Known gaps and ideas

- The API needs a session cookie; there are no API tokens.
- Every request loads all tables and all messages. Scope the loads if the data
  grows.
- `npm audit`: four highs inside the Prisma CLI's own dependencies. The only fix
  offered downgrades to Prisma 6.
- There's no drag and drop on the boards (the README mentions it); cards move
  with the status dropdown.

## UX

The owner wants UX principles followed. The top bar was cluttered with about 20
links; see the "UX cleanup" entry in the log below for what was done.

## Log

- 2026-09-28: first pass of all tickets, then Prisma, Docker, dummy sign-in and
  roles, then messages moved to Mongo. Now: UX cleanup of the navigation.
