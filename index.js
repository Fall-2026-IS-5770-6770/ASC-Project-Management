const crypto = require("crypto");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

// ===== DATA =====
// The dummy data in /data stands in for the database until one is wired up.
// Each array is changed in place, so edits last until the server restarts.
const projects = require("./data/projects.js");
const statuses = require("./data/statuses.js");
const mainBoardStatuses = require("./data/mainBoardStatuses.js");
const clients = require("./data/clients.js");
const people = require("./data/people.js");
const mentors = require("./data/mentors.js");
const students = require("./data/students.js");
const projectPeople = require("./data/projectPeople.js");
const projectStatuses = require("./data/projectStatuses.js");
const requirements = require("./data/requirements.js");
const channels = require("./data/channels.js");
const skills = require("./data/skills.js");
const projectTypes = require("./data/projectTypes.js");
const projectSkills = require("./data/projectSkills.js");
const personSkills = require("./data/personSkills.js");
const projectProjectTypes = require("./data/projectProjectTypes.js");
const documents = require("./data/documents.js");
const threads = require("./data/threads.js");
const { messages, currentPersonId: DEFAULT_PERSON_ID } = require("./data/messages.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({ extended: true }));

// Express 5 leaves req.body undefined when a request has no body
app.use((req, res, next) => {
    req.body = req.body || {};
    next();
});


// ===== SESSIONS =====
// Session data lives in express-session's default in-memory store for now.
// That store forgets every session when the server restarts and can't be
// shared between processes, which is why express-session warns about it in
// production. A persistent store (the database or MongoDB) is a later issue.

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
if (!process.env.SESSION_SECRET) {
    console.warn("SESSION_SECRET is not set; using a random secret, so sessions end whenever the server restarts.");
}

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// In production the app is expected to sit behind an HTTPS proxy, so trust it
// to report the original protocol; otherwise secure cookies would never be set.
if (IS_PRODUCTION) {
    app.set("trust proxy", 1);
}

// Session cookie choices:
// - name: a neutral name instead of the default "connect.sid", which
//   advertises the framework.
// - maxAge 8 hours: about one working day, so a session left open on a
//   shared lab machine doesn't last indefinitely. rolling resets the clock
//   on every request, so active users aren't signed out mid-task.
// - httpOnly: page scripts can't read the cookie, which limits what an XSS
//   bug could steal.
// - sameSite "lax": the cookie isn't sent on cross-site POSTs (a CSRF
//   defense for every form here) but still arrives when someone follows a
//   link into the app, which sign-in redirects will need.
// - secure in production: only sent over HTTPS. Left off in development
//   because localhost is plain HTTP.
app.use(session({
    name: "asc.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 8 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: IS_PRODUCTION
    }
}));

// Development-only look at the current session, to confirm values persist
// from one request to the next
if (!IS_PRODUCTION) {
    app.get("/dev/session", (req, res) => {
        req.session.views = (req.session.views || 0) + 1;
        res.json({ id: req.sessionID, session: req.session });
    });
}

// ===== MONGODB LOGS =====
// Logs are written to MongoDB through Mongoose models. The connection string
// comes from MONGODB_URI. Without it (or while MongoDB is unreachable) the app
// keeps working and log entries are skipped, with a warning at startup.
// Writes are fire-and-forget so a slow or failing log never breaks a route.

const MONGODB_URI = process.env.MONGODB_URI;

// Fail fast instead of queueing log writes while disconnected
mongoose.set("bufferCommands", false);

if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
        .then(() => console.log("Connected to MongoDB for logs"))
        .catch(error => console.error(`Couldn't connect to MongoDB, so logs won't be saved: ${error.message}`));
} else {
    console.warn("MONGODB_URI is not set, so logs won't be saved.");
}

function logsEnabled() {
    return mongoose.connection.readyState === 1;
}

function writeLog(Model, entry) {
    if (!logsEnabled()) {
        return;
    }
    Model.create(entry).catch(error => console.error(`Couldn't write to ${Model.modelName}: ${error.message}`));
}

// Fields every change log shares: what happened, who did it, and when
const LOG_FIELDS = {
    action: { type: String, required: true },
    actorPersonId: { type: Number, default: null },
    at: { type: Date, default: Date.now, index: true }
};

function logModel(name, fields) {
    const schema = new mongoose.Schema({ ...fields, ...LOG_FIELDS }, { versionKey: false });
    return mongoose.models[name] || mongoose.model(name, schema);
}

// Issue #78: a durable record of every route that fails
const ErrorLog = logModel("ErrorLog", {
    message: { type: String, required: true },
    stack: String,
    method: String,
    path: String,
    statusCode: { type: Number, required: true }
});


// Log writers subscribe to the changes recorded for a resource. Each listener
// gets the change history entry (action, actorPersonId, changes) and the record.
const CHANGE_LISTENERS = {};

function onChange(entityKey, listener) {
    (CHANGE_LISTENERS[entityKey] = CHANGE_LISTENERS[entityKey] || []).push(listener);
}

// Issue #79: every move of a project between main board columns
const ProjectStatusLog = logModel("ProjectStatusLog", {
    projectId: { type: Number, required: true, index: true },
    projectName: String,
    fromStatusId: { type: Number, default: null },
    fromStatus: { type: String, default: null },
    toStatusId: { type: Number, required: true },
    toStatus: String
});

onChange("projects", (entry, project) => {
    const move = entry.action === "created"
        ? { from: null, to: project.mainBoardStatusId }
        : entry.changes.mainBoardStatusId;
    if (!move || (entry.action !== "created" && entry.action !== "updated")) {
        return;
    }
    writeLog(ProjectStatusLog, {
        action: entry.action === "created" ? "created" : "status changed",
        projectId: project.id,
        projectName: project.name,
        fromStatusId: move.from,
        fromStatus: move.from == null ? null : displayOf("mainBoardStatuses", move.from),
        toStatusId: move.to,
        toStatus: displayOf("mainBoardStatuses", move.to),
        actorPersonId: entry.actorPersonId
    });
});


// Issue #80: every move of a task (requirement) between columns on a project board
const TaskStatusLog = logModel("TaskStatusLog", {
    requirementId: { type: Number, required: true, index: true },
    projectId: { type: Number, required: true, index: true },
    title: String,
    fromStatusId: { type: Number, default: null },
    fromStatus: { type: String, default: null },
    toStatusId: { type: Number, required: true },
    toStatus: String
});

onChange("requirements", (entry, requirement) => {
    const move = entry.action === "created"
        ? { from: null, to: requirement.statusId }
        : entry.changes.statusId;
    if (!move || (entry.action !== "created" && entry.action !== "updated")) {
        return;
    }
    writeLog(TaskStatusLog, {
        action: entry.action === "created" ? "created" : "status changed",
        requirementId: requirement.id,
        projectId: requirement.projectId,
        title: requirement.title,
        fromStatusId: move.from,
        fromStatus: move.from == null ? null : displayOf("statuses", move.from),
        toStatusId: move.to,
        toStatus: displayOf("statuses", move.to),
        actorPersonId: entry.actorPersonId
    });
});


// A log of whole-record changes: created and deleted entries keep a snapshot
// of the record, updated entries keep each changed field's before and after.
// ignore leaves out fields another log already covers, extra adds columns
// for querying, and actionFor can rename the action.
function logRecordChanges(modelName, entityKey, idField, { ignore = [], fields = {}, extra = () => ({}), actionFor } = {}) {
    const Model = logModel(modelName, {
        [idField]: { type: Number, required: true, index: true },
        summary: String,
        changes: { type: mongoose.Schema.Types.Mixed, default: {} },
        snapshot: { type: mongoose.Schema.Types.Mixed, default: null },
        ...fields
    });

    onChange(entityKey, (entry, record) => {
        if (!["created", "updated", "deleted"].includes(entry.action)) {
            return;
        }
        const changes = Object.fromEntries(Object.entries(entry.changes).filter(([name]) => !ignore.includes(name)));
        if (entry.action === "updated" && Object.keys(changes).length === 0) {
            return;
        }
        writeLog(Model, {
            action: actionFor ? actionFor(entry.action, changes) : entry.action,
            [idField]: record.id,
            summary: entry.summary,
            changes,
            snapshot: entry.action === "updated" ? null : { ...record },
            actorPersonId: entry.actorPersonId,
            ...extra(record)
        });
    });
    return Model;
}

// Issue #81: skills added, renamed, recategorized, or removed
logRecordChanges("SkillUpdateLog", "skills", "skillId");


// Issue #82: changes to a student's availability, hours, graduation date, approval, and so on
logRecordChanges("StudentProfileLog", "students", "studentId", {
    fields: { personId: { type: Number, index: true } },
    extra: student => ({ personId: student.personId })
});


// Issue #83: changes to a mentor's availability, maximum project load, preferred type, and so on
logRecordChanges("MentorProfileLog", "mentors", "mentorId", {
    fields: { personId: { type: Number, index: true } },
    extra: mentor => ({ personId: mentor.personId })
});


// Assignment logs follow project person associations for one role. A person
// is "added" when a row gives them that role on a project and "removed" when
// the row is deleted, its role changes away, or they roll off (status set to
// Completed or Removed). Other edits to the row are "updated".
function logAssignments(modelName, role) {
    const Model = logModel(modelName, {
        projectId: { type: Number, required: true, index: true },
        projectName: String,
        personId: { type: Number, required: true, index: true },
        personName: String,
        startDate: String,
        endDate: String,
        status: String,
        changes: { type: mongoose.Schema.Types.Mixed, default: {} }
    });
    const rolledOff = status => status === "Completed" || status === "Removed";

    onChange("projectPeople", (entry, row) => {
        const before = {
            role: entry.changes.role ? entry.changes.role.from : row.role,
            status: entry.changes.status ? entry.changes.status.from : row.status,
            projectId: entry.changes.projectId ? entry.changes.projectId.from : row.projectId,
            personId: entry.changes.personId ? entry.changes.personId.from : row.personId
        };
        const wasOn = entry.action !== "created" && before.role === role && !rolledOff(before.status);
        const isOn = entry.action !== "deleted" && row.role === role && !rolledOff(row.status);
        const moved = before.projectId !== row.projectId || before.personId !== row.personId;

        const write = (action, projectId, personId) => writeLog(Model, {
            action,
            projectId,
            projectName: displayOf("projects", projectId),
            personId,
            personName: displayOf("people", personId),
            startDate: row.startDate,
            endDate: row.endDate,
            status: row.status,
            changes: entry.changes,
            actorPersonId: entry.actorPersonId
        });

        if (wasOn && (!isOn || moved)) {
            write("removed", before.projectId, before.personId);
        }
        if (isOn && (!wasOn || moved)) {
            write("added", row.projectId, row.personId);
        } else if (isOn && wasOn && entry.action === "updated") {
            write("updated", row.projectId, row.personId);
        }
    });
    return Model;
}

// Issue #84: who mentored which project, and when
logAssignments("ProjectMentorAssignmentLog", "Faculty Mentor");


// Issue #85: who worked on which project as a student, and when
logAssignments("ProjectStudentAssignmentLog", "Student");


// One-time messages: set before a redirect, shown on the next page, then cleared
function flash(req, type, text) {
    req.session.flash = { type, text };
}

// ----- Acting person -----
// Sign-in doesn't exist yet, so the application puts a stand-in person on the
// session itself: the dummy data's currentPersonId by default. Routes read the
// acting person from the session and record them on every change. Replace
// this with the signed-in user once authentication lands.
app.use((req, res, next) => {
    if (!people.some(person => person.id === req.session.personId)) {
        req.session.personId = people.some(person => person.id === DEFAULT_PERSON_ID) ? DEFAULT_PERSON_ID : people[0]?.id;
    }
    res.locals.actingPersonId = req.session.personId;
    next();
});

// Development-only switch for acting as someone else
if (!IS_PRODUCTION) {
    app.post("/dev/act-as", (req, res) => {
        const personId = Number(req.body.personId);
        if (people.some(person => person.id === personId)) {
            req.session.personId = personId;
        }
        redirectBack(res, req.body.returnTo, "/");
    });
}

app.use((req, res, next) => {
    if (req.session.flash) {
        res.locals.flash = req.session.flash;
        delete req.session.flash;
    }
    next();
});


// ===== HTML HELPERS =====

// Escape anything that came from the data or from a user before it goes into HTML
function esc(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Links in the top navigation. Each resource adds itself once it has pages.
const NAV = [
    { href: "/projects", label: "Main board" }
];

const STYLES = `
    :root { --bg: #f4f5f8; --panel: #fff; --text: #1d2330; --muted: #667085; --line: #d9dde5;
            --accent: #0f3d7a; --danger: #b42318; --ok: #067647; --column: #e7eaf0; }
    * { box-sizing: border-box; }
    [hidden] { display: none !important; }
    body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: var(--bg); color: var(--text); }
    body > header { background: var(--accent); color: #fff; padding: .6rem 1rem; display: flex; flex-wrap: wrap; gap: .3rem 1rem; align-items: center; }
    body > header a { color: #fff; text-decoration: none; opacity: .9; }
    body > header a:hover { opacity: 1; text-decoration: underline; }
    .acting-as { margin-left: auto; font-size: .85rem; }
    .acting-as select { padding: .15rem; }
    body > header .brand { font-weight: 700; opacity: 1; margin-right: .5rem; }
    main { padding: 1rem; max-width: 1400px; margin: 0 auto; }
    h1 { font-size: 1.5rem; margin: .5rem 0 1rem; }
    a { color: var(--accent); }
    .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .toolbar h1 { margin: 0; }
    .board { display: flex; gap: .75rem; overflow-x: auto; align-items: flex-start; padding-bottom: .5rem; }
    .column { background: var(--column); border-radius: 8px; padding: .5rem; flex: 0 0 260px; }
    .column h3 { margin: .25rem .25rem .6rem; font-size: 1rem; display: flex; justify-content: space-between; gap: .5rem; }
    .count { color: var(--muted); font-weight: normal; }
    .card { background: var(--panel); border: 1px solid var(--line); border-radius: 6px; padding: .6rem; margin-bottom: .5rem; }
    .card h4 { margin: 0 0 .35rem; font-size: .95rem; }
    .card p { margin: .15rem 0; font-size: .85rem; }
    .row-actions { display: flex; gap: .15rem; justify-content: flex-end; align-items: center; }
    .inline { display: inline; margin: 0; }
    .muted { color: var(--muted); }
    .progress { background: #e4e7ec; border-radius: 4px; height: 8px; overflow: hidden; margin-top: .4rem; }
    .progress span { display: block; height: 100%; background: var(--ok); }
    .panel { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
    .panel h2 { font-size: 1.1rem; margin: 0 0 .75rem; }
    table { border-collapse: collapse; width: 100%; background: var(--panel); }
    th, td { text-align: left; padding: .45rem .6rem; border-bottom: 1px solid var(--line); vertical-align: top; }
    dl.details { display: grid; grid-template-columns: max-content 1fr; gap: .35rem 1.25rem; margin: 0; }
    dl.details dt { font-weight: 600; }
    dl.details dd { margin: 0; }
    dialog { border: none; border-radius: 8px; padding: 1.25rem; width: min(560px, 95vw); box-shadow: 0 10px 40px rgba(0, 0, 0, .25); }
    dialog h3 { margin-top: 0; }
    .stack { display: flex; flex-direction: column; gap: .6rem; }
    .stack label { display: flex; flex-direction: column; gap: .2rem; font-weight: 600; font-size: .9rem; }
    .stack label.check { flex-direction: row; align-items: center; gap: .4rem; }
    fieldset { border: 1px solid var(--line); border-radius: 4px; display: grid; gap: .4rem; }
    input, select, textarea { font: inherit; padding: .4rem; border: 1px solid var(--line); border-radius: 4px; font-weight: normal; }
    button { font: inherit; cursor: pointer; padding: .4rem .8rem; border-radius: 4px; border: 1px solid var(--accent); background: var(--accent); color: #fff; }
    button.secondary, button[formmethod="dialog"] { background: #fff; color: var(--accent); }
    .icon-btn { background: none; border: 1px solid transparent; color: inherit; padding: .15rem .3rem; font-size: 1rem; line-height: 1; text-decoration: none; border-radius: 4px; }
    .icon-btn:hover { border-color: var(--line); background: #fff; }
    .actions { display: flex; gap: .5rem; }
    .flash { padding: .75rem 1rem; border-radius: 6px; margin-bottom: 1rem; border: 1px solid; }
    .flash-success { background: #ecfdf3; border-color: #abefc6; color: var(--ok); }
    .flash-error { background: #fef3f2; border-color: #fecdca; color: var(--danger); }
    .errors { background: #fef3f2; border: 1px solid #fecdca; color: var(--danger); padding: .75rem 1rem; border-radius: 6px; }
    ul.threads { list-style: none; padding: 0; margin: 0; }
    li.thread { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; padding: .4rem 0; border-bottom: 1px solid var(--line); }
    .thread-link { font-weight: 600; }
    .chat { display: flex; flex-direction: column; gap: .6rem; margin-bottom: 1rem; }
    .msg { max-width: min(640px, 85%); background: #fff; border: 1px solid var(--line); border-radius: 10px; padding: .5rem .75rem; align-self: flex-start; }
    .msg.mine { align-self: flex-end; background: #e8f0fb; border-color: #c7d7f0; }
    .msg header { display: flex; gap: .5rem; align-items: baseline; font-size: .85rem; }
    .msg p { margin: .3rem 0; white-space: pre-wrap; }
    .edit-in-place summary { list-style: none; cursor: pointer; font-size: .85rem; }
    .edit-in-place summary::-webkit-details-marker { display: none; }
    .edit-in-place[open] { flex-basis: 100%; }
    .composer { display: flex; gap: .5rem; align-items: flex-end; }
    .composer textarea { flex: 1; }
    .tag { display: inline-block; background: var(--column); border-radius: 999px; padding: .05rem .5rem; font-size: .8rem; }
`;

// Wrap page content in the shared layout
function sendPage(res, title, body, statusCode = 200) {
    res.status(statusCode).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)} | ASC Project Management</title>
    <style>${STYLES}</style>
</head>
<body>
    <header>
        <a class="brand" href="/">ASC Project Management</a>
        ${NAV.map(link => `<a href="${esc(link.href)}">${esc(link.label)}</a>`).join("")}
        ${actingAsControl(res)}
    </header>
    <main>${flashMessage(res.locals.flash)}${body}</main>
</body>
</html>`);
}

// Who the app thinks is making changes. In development it can be switched.
function actingAsControl(res) {
    const personId = res.locals.actingPersonId;
    if (!personId) {
        return "";
    }
    if (IS_PRODUCTION) {
        return `<span class="acting-as">Acting as ${esc(displayOf("people", personId))}</span>`;
    }
    const options = [...people].sort(ENTITIES.people.sort).map(person => ({ value: person.id, label: ENTITIES.people.display(person) }));
    return `<form class="acting-as" method="POST" action="/dev/act-as">
        <input type="hidden" name="returnTo" value="${esc(res.req.originalUrl)}">
        <label>Acting as <select name="personId" onchange="this.form.submit()">${selectOptions(options, personId)}</select></label>
        <noscript><button type="submit">Switch</button></noscript>
    </form>`;
}

function flashMessage(message) {
    return message ? `<div class="flash flash-${esc(message.type)}" role="status">${esc(message.text)}</div>` : "";
}

function sendNotFound(res, label, id) {
    sendPage(res, "Not found", `<h1>Not found</h1><p>No ${esc(label)} with id ${esc(id)} exists.</p><p><a href="/">Back to the main board</a></p>`, 404);
}

// Shown when a submitted form doesn't pass validation
function sendErrors(res, errors, backHref) {
    sendPage(res, "Please fix the form", `
        <h1>Please fix the form</h1>
        <div class="errors"><ul>${errors.map(error => `<li>${esc(error)}</li>`).join("")}</ul></div>
        <p><a href="${esc(backHref)}">Go back</a></p>
    `, 400);
}

// Only follow redirects to paths on this site
function redirectBack(res, target, fallback) {
    const isLocal = typeof target === "string" && target.startsWith("/") && !target.startsWith("//") && !target.includes("\\");
    res.redirect(isLocal ? target : fallback);
}

// Pencil icon that goes to the edit page
function editButton(href, label) {
    return `<a class="icon-btn" href="${esc(href)}" title="Edit ${esc(label)}" aria-label="Edit ${esc(label)}">✏️</a>`;
}

// Trash icon that confirms before the delete route runs
function deleteButton(action, label, hidden = {}) {
    const question = JSON.stringify(`Delete ${label}?`);
    return `<form class="inline" method="POST" action="${esc(action)}" onsubmit="return confirm(${esc(question)})">
        ${hiddenInputs(hidden)}
        <button class="icon-btn" type="submit" title="Delete ${esc(label)}" aria-label="Delete ${esc(label)}">🗑️</button>
    </form>`;
}

function hiddenInputs(values) {
    return Object.entries(values)
        .map(([name, value]) => `<input type="hidden" name="${esc(name)}" value="${esc(value)}">`)
        .join("");
}

// Create forms open in a modal
function modal(id, title, content) {
    return `<dialog id="${esc(id)}"><h3>${esc(title)}</h3>${content}</dialog>`;
}

function modalButton(id, label, className = "") {
    return `<button type="button" class="${esc(className)}" onclick="document.getElementById('${esc(id)}').showModal()">${esc(label)}</button>`;
}

function selectOptions(options, selected) {
    const selectedValues = [].concat(selected ?? []).map(String);
    return options
        .map(option => `<option value="${esc(option.value)}"${selectedValues.includes(String(option.value)) ? " selected" : ""}>${esc(option.label)}</option>`)
        .join("");
}

function byOrder(a, b) {
    return a.order - b.order;
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

// Timestamps are stored like the dummy data: YYYY-MM-DDTHH:MM:SS
function nowStamp() {
    return new Date().toISOString().slice(0, 19);
}

// The person making the request, read from the session (see "Acting person")
function actingPersonId(req) {
    return req.session.personId;
}


// ===== RECORDS =====
// Every resource is described once here. The description drives its form, the
// validation of whatever a form or API sends, and what happens to the records
// that point at it when it is deleted.
//
// Field types: text, textarea, email, url, number, date, datetime, checkbox,
// select (options: [...] for a fixed list, or ref: "entity" for another record),
// multiselect (ref: "entity", stored as an array of ids), list (comma separated
// text stored as an array), and address.
// A ref field marked cascade is deleted along with the record it points at.

const PROJECT_ROLES = ["Project Manager", "Faculty Mentor", "Student", "Sponsor"];
const PROFICIENCIES = ["Beginner", "Intermediate", "Advanced", "Expert"];

const ENTITIES = {
    projects: {
        label: "project",
        plural: "projects",
        store: projects,
        display: project => project.name,
        recordActor: true,
        fields: [
            { name: "name", label: "Name", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
            { name: "clientId", label: "Client", type: "select", ref: "clients", required: true },
            { name: "mainBoardStatusId", label: "Status", type: "select", ref: "mainBoardStatuses", required: true },
            { name: "projectManagerId", label: "Project manager", type: "select", ref: "people" },
            { name: "startDate", label: "Start date", type: "date" },
            { name: "midpointDate", label: "Midpoint date", type: "date" },
            { name: "endDate", label: "End date", type: "date" },
            { name: "budget", label: "Budget ($)", type: "number", min: 0 },
            { name: "estimatedHours", label: "Estimated hours", type: "number", min: 0 },
            { name: "notes", label: "Notes", type: "textarea" }
        ],
        afterCreate: (project, { actorId }) => {
            if (isInProgress(project.mainBoardStatusId)) {
                initializeWorkspace(project, actorId);
            }
        },
        afterUpdate: (project, before, { actorId }) => {
            if (project.mainBoardStatusId !== before.mainBoardStatusId && isInProgress(project.mainBoardStatusId)) {
                initializeWorkspace(project, actorId);
            }
        }
    },
    statuses: {
        label: "status",
        plural: "statuses",
        store: statuses,
        display: status => status.name,
        recordActor: true,
        sort: byOrder,
        fields: [
            { name: "name", label: "Name", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea", required: true },
            { name: "order", label: "Board order", type: "number", min: 0 }
        ],
        defaults: () => ({ order: nextOrder(statuses) })
    },
    projectStatuses: {
        label: "project status",
        plural: "project statuses",
        store: projectStatuses,
        display: row => `${displayOf("statuses", row.statusId)} on ${displayOf("projects", row.projectId)}`,
        recordActor: true,
        fields: [
            { name: "projectId", label: "Project", type: "select", ref: "projects", required: true, cascade: true },
            { name: "statusId", label: "Status", type: "select", ref: "statuses", required: true },
            { name: "order", label: "Column order", type: "number", min: 0 }
        ],
        defaults: row => ({ order: nextOrder(projectStatuses.filter(other => other.projectId === row.projectId)) }),
        // A project can't list the same status twice
        validate: (row, existing) => projectStatuses.some(other => other !== existing
            && other.projectId === row.projectId && other.statusId === row.statusId)
            ? [`${displayOf("projects", row.projectId)} already uses the ${displayOf("statuses", row.statusId)} status`]
            : []
    },
    mainBoardStatuses: {
        label: "main board status",
        plural: "main board statuses",
        store: mainBoardStatuses,
        display: status => status.name,
        recordActor: true,
        sort: byOrder,
        fields: [
            { name: "name", label: "Name", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
            { name: "order", label: "Board order", type: "number", min: 0 }
        ],
        defaults: () => ({ order: nextOrder(mainBoardStatuses) })
    },
    clients: {
        label: "client",
        plural: "clients",
        store: clients,
        display: client => client.name,
        recordActor: true,
        sort: (a, b) => a.name.localeCompare(b.name),
        fields: [
            { name: "name", label: "Name", type: "text", required: true },
            { name: "type", label: "Type", type: "select", options: ["Profit", "Non-Profit", "Internal"], required: true },
            { name: "contactPersonName", label: "Contact person", type: "text" },
            { name: "contactEmail", label: "Contact email", type: "email" },
            { name: "phone", label: "Phone", type: "text" },
            { name: "address", label: "Address", type: "address" },
            { name: "billingEmail", label: "Billing email", type: "email" },
            { name: "billingTerms", label: "Billing terms", type: "text" }
        ],
        validate: (client, existing) => clients.some(other => other !== existing
            && other.name.toLowerCase() === String(client.name).toLowerCase())
            ? [`A client named ${client.name} already exists`]
            : []
    },
    people: {
        label: "person",
        plural: "people",
        store: people,
        display: person => `${person.firstName} ${person.lastName}`,
        recordActor: true,
        sort: (a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName),
        fields: [
            { name: "firstName", label: "First name", type: "text", required: true },
            { name: "lastName", label: "Last name", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "phone", label: "Phone", type: "text" },
            { name: "address", label: "Address", type: "address" }
        ],
        // Email identifies a person, so two people can't share one
        validate: (person, existing) => people.some(other => other !== existing
            && other.email.toLowerCase() === String(person.email).toLowerCase())
            ? [`Someone already uses the email ${person.email}`]
            : []
    },
    mentors: {
        label: "mentor",
        plural: "mentors",
        store: mentors,
        display: mentor => displayOf("people", mentor.personId),
        recordActor: true,
        fields: [
            { name: "personId", label: "Person", type: "select", ref: "people", required: true },
            { name: "department", label: "Department", type: "text" },
            { name: "availability", label: "Availability", type: "text" },
            { name: "maxProjectLoad", label: "Maximum project load", type: "number", min: 0 },
            { name: "preferredProjectTypeId", label: "Preferred project type", type: "select", ref: "projectTypes" },
            { name: "skillIds", label: "Skills", type: "multiselect", ref: "skills" }
        ],
        validate: (mentor, existing) => mentors.some(other => other !== existing && other.personId === mentor.personId)
            ? [`${displayOf("people", mentor.personId)} is already a mentor`]
            : []
    },
    students: {
        label: "student",
        plural: "students",
        store: students,
        display: student => displayOf("people", student.personId),
        recordActor: true,
        fields: [
            { name: "personId", label: "Person", type: "select", ref: "people", required: true },
            { name: "major", label: "Major", type: "text" },
            { name: "graduationDate", label: "Graduation date", type: "date" },
            { name: "resumeUrl", label: "Resume link", type: "url" },
            { name: "minHoursPerWeek", label: "Minimum hours per week", type: "number", min: 0 },
            { name: "maxHoursPerWeek", label: "Maximum hours per week", type: "number", min: 0 },
            { name: "workApprovalStatus", label: "Work approval status", type: "select", options: ["Approved", "Pending", "Not Approved"], required: true },
            { name: "availability", label: "Availability", type: "text" },
            { name: "preferredProjectTypeId", label: "Preferred project type", type: "select", ref: "projectTypes" },
            { name: "skillIds", label: "Skills", type: "multiselect", ref: "skills" }
        ],
        validate: (student, existing) => {
            const errors = [];
            if (students.some(other => other !== existing && other.personId === student.personId)) {
                errors.push(`${displayOf("people", student.personId)} is already a student`);
            }
            if (student.minHoursPerWeek != null && student.maxHoursPerWeek != null && student.minHoursPerWeek > student.maxHoursPerWeek) {
                errors.push("Minimum hours per week can't be more than the maximum");
            }
            return errors;
        }
    },
    skills: {
        label: "skill",
        plural: "skills",
        store: skills,
        display: skill => skill.name,
        recordActor: true,
        sort: (a, b) => a.name.localeCompare(b.name),
        fields: [
            { name: "name", label: "Name", type: "text", required: true },
            { name: "category", label: "Category", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" }
        ],
        validate: (skill, existing) => skills.some(other => other !== existing
            && other.name.toLowerCase() === String(skill.name).toLowerCase())
            ? [`A skill named ${skill.name} already exists`]
            : []
    },
    projectSkills: {
        label: "project skill",
        plural: "project skills",
        store: projectSkills,
        display: row => `${displayOf("skills", row.skillId)} for ${displayOf("projects", row.projectId)}`,
        recordActor: true,
        fields: [
            { name: "projectId", label: "Project", type: "select", ref: "projects", required: true, cascade: true },
            { name: "skillId", label: "Skill", type: "select", ref: "skills", required: true, cascade: true },
            { name: "importance", label: "Importance", type: "select", options: ["Required", "Preferred"], required: true },
            { name: "minimumProficiency", label: "Minimum proficiency", type: "select", options: PROFICIENCIES }
        ],
        validate: (row, existing) => projectSkills.some(other => other !== existing
            && other.projectId === row.projectId && other.skillId === row.skillId)
            ? [`${displayOf("projects", row.projectId)} already lists ${displayOf("skills", row.skillId)}`]
            : []
    },
    personSkills: {
        label: "person skill",
        plural: "person skills",
        store: personSkills,
        display: row => `${displayOf("people", row.personId)}: ${displayOf("skills", row.skillId)}`,
        recordActor: true,
        fields: [
            { name: "personId", label: "Person", type: "select", ref: "people", required: true, cascade: true },
            { name: "skillId", label: "Skill", type: "select", ref: "skills", required: true, cascade: true },
            { name: "proficiency", label: "Proficiency", type: "select", options: PROFICIENCIES, required: true },
            { name: "yearsExperience", label: "Years of experience", type: "number", min: 0 },
            { name: "lastUsed", label: "Last used", type: "date" }
        ],
        validate: (row, existing) => personSkills.some(other => other !== existing
            && other.personId === row.personId && other.skillId === row.skillId)
            ? [`${displayOf("people", row.personId)} already has ${displayOf("skills", row.skillId)}`]
            : []
    },
    projectTypes: {
        label: "project type",
        plural: "project types",
        store: projectTypes,
        display: type => type.name,
        recordActor: true,
        sort: (a, b) => a.name.localeCompare(b.name),
        fields: [
            { name: "name", label: "Name", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
            { name: "typicalDurationWeeks", label: "Typical duration (weeks)", type: "number", min: 0 },
            { name: "typicalDeliverables", label: "Typical deliverables", type: "list" },
            { name: "typicalSkillIds", label: "Typical skills", type: "multiselect", ref: "skills" }
        ],
        validate: (type, existing) => projectTypes.some(other => other !== existing
            && other.name.toLowerCase() === String(type.name).toLowerCase())
            ? [`A project type named ${type.name} already exists`]
            : []
    },
    projectProjectTypes: {
        label: "project type association",
        plural: "project type associations",
        store: projectProjectTypes,
        display: row => `${displayOf("projects", row.projectId)}: ${displayOf("projectTypes", row.projectTypeId)}`,
        recordActor: true,
        fields: [
            { name: "projectId", label: "Project", type: "select", ref: "projects", required: true, cascade: true },
            { name: "projectTypeId", label: "Project type", type: "select", ref: "projectTypes", required: true, cascade: true },
            { name: "isPrimary", label: "Primary type for this project", type: "checkbox" }
        ],
        validate: (row, existing) => projectProjectTypes.some(other => other !== existing
            && other.projectId === row.projectId && other.projectTypeId === row.projectTypeId)
            ? [`${displayOf("projects", row.projectId)} is already a ${displayOf("projectTypes", row.projectTypeId)} project`]
            : [],
        afterCreate: row => keepOnePrimaryType(row),
        afterUpdate: row => keepOnePrimaryType(row)
    },
    documents: {
        label: "document",
        plural: "documents",
        store: documents,
        display: document => document.name,
        recordActor: true,
        fields: [
            { name: "name", label: "Name", type: "text", required: true },
            { name: "projectId", label: "Project", type: "select", ref: "projects", required: true, cascade: true },
            { name: "type", label: "Type", type: "select", options: ["Statement of Work", "Requirements", "Design", "Reference", "Handoff", "Other"], required: true },
            { name: "fileName", label: "File name", type: "text" },
            { name: "fileUrl", label: "File URL", type: "url" },
            { name: "personId", label: "Uploaded by", type: "select", ref: "people" },
            { name: "uploadedDate", label: "Uploaded on", type: "date" },
            { name: "version", label: "Version", type: "text" },
            { name: "status", label: "Status", type: "select", options: ["Draft", "In Review", "Approved", "Final"], required: true }
        ],
        defaults: () => ({ uploadedDate: today(), version: "1.0" })
    },
    channels: {
        label: "channel",
        plural: "channels",
        store: channels,
        display: channel => `#${channel.name}`,
        recordActor: true,
        fields: [
            { name: "name", label: "Name", type: "text", required: true },
            { name: "projectId", label: "Project", type: "select", ref: "projects", required: true, cascade: true },
            { name: "type", label: "Type", type: "select", options: ["Team", "Client", "Topic", "Archived"], required: true },
            { name: "url", label: "URL or identifier", type: "url" },
            { name: "participantPersonIds", label: "Members", type: "multiselect", ref: "people" },
            { name: "createdDate", label: "Created on", type: "date" }
        ],
        defaults: () => ({ createdDate: today() }),
        // Channel names are unique inside a project's workspace
        validate: (channel, existing) => channels.some(other => other !== existing
            && other.projectId === channel.projectId && other.name.toLowerCase() === String(channel.name).toLowerCase())
            ? [`${displayOf("projects", channel.projectId)} already has a #${channel.name} channel`]
            : []
    },
    threads: {
        label: "thread",
        plural: "threads",
        store: threads,
        display: thread => thread.name,
        recordActor: true,
        fields: [
            { name: "channelId", label: "Channel", type: "select", ref: "channels", required: true, cascade: true },
            { name: "name", label: "Name", type: "text", required: true },
            { name: "createdByPersonId", label: "Started by", type: "select", ref: "people" },
            { name: "createdAt", label: "Started", type: "datetime" },
            { name: "lastActivityAt", label: "Last active", type: "datetime" }
        ],
        defaults: () => ({ createdAt: nowStamp(), lastActivityAt: nowStamp() })
    },
    messages: {
        label: "message",
        plural: "messages",
        store: messages,
        display: message => `${displayOf("people", message.senderPersonId)}: ${message.body.slice(0, 40)}`,
        recordActor: true,
        fields: [
            { name: "threadId", label: "Thread", type: "select", ref: "threads", required: true, cascade: true },
            { name: "channelId", label: "Channel", type: "select", ref: "channels", required: true, cascade: true },
            { name: "senderPersonId", label: "Sender", type: "select", ref: "people", required: true },
            { name: "body", label: "Message", type: "textarea", required: true },
            { name: "postedAt", label: "Posted", type: "datetime" },
            { name: "editedAt", label: "Edited", type: "datetime" }
        ],
        defaults: () => ({ postedAt: nowStamp() }),
        // The channel is kept on the row for per-channel queries, so it has to match the thread's
        validate: message => {
            const thread = findById("threads", message.threadId);
            return thread && thread.channelId !== message.channelId ? ["Channel must be the thread's channel"] : [];
        },
        afterCreate: message => {
            const thread = findById("threads", message.threadId);
            if (thread && String(message.postedAt) > String(thread.lastActivityAt)) {
                thread.lastActivityAt = message.postedAt;
            }
        }
    },
    requirements: {
        label: "requirement",
        plural: "requirements",
        store: requirements,
        display: requirement => requirement.title,
        recordActor: true,
        fields: [
            { name: "projectId", label: "Project", type: "select", ref: "projects", required: true, cascade: true },
            { name: "title", label: "Title", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
            { name: "statusId", label: "Status", type: "select", ref: "statuses", required: true },
            { name: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High", "Critical"] },
            { name: "dueDate", label: "Due date", type: "date" },
            { name: "assignedPersonId", label: "Assigned to", type: "select", ref: "people" },
            { name: "mentorPersonId", label: "Mentor", type: "select", ref: "people" },
            { name: "acceptanceCriteria", label: "Acceptance criteria", type: "textarea" },
            { name: "estimatedHours", label: "Estimated hours", type: "number", min: 0 },
            { name: "actualHours", label: "Actual hours", type: "number", min: 0 }
        ]
    },
    projectPeople: {
        label: "project assignment",
        plural: "project assignments",
        store: projectPeople,
        display: row => `${displayOf("people", row.personId)} (${row.role}) on ${displayOf("projects", row.projectId)}`,
        recordActor: true,
        fields: [
            { name: "projectId", label: "Project", type: "select", ref: "projects", required: true, cascade: true },
            { name: "personId", label: "Person", type: "select", ref: "people", required: true },
            { name: "role", label: "Role", type: "select", options: PROJECT_ROLES, required: true },
            { name: "startDate", label: "Start date", type: "date" },
            { name: "endDate", label: "End date", type: "date" },
            { name: "assignedHours", label: "Assigned hours", type: "number", min: 0 },
            { name: "approvalStatus", label: "Approval status", type: "select", options: ["Approved", "Pending", "Not Approved"] },
            { name: "status", label: "Status", type: "select", options: ["Active", "Pending Onboarding", "Completed", "Removed"] }
        ],
        defaults: () => ({ startDate: today(), approvalStatus: "Approved", status: "Active" }),
        validate: (row, existing) => {
            const duplicate = projectPeople.some(other => other !== existing
                && other.projectId === row.projectId && other.personId === row.personId && other.role === row.role);
            return duplicate ? [`${displayOf("people", row.personId)} is already a ${row.role} on this project`] : [];
        },
        afterCreate: row => syncWorkspaceMember(row.projectId, row.personId),
        afterUpdate: (row, before) => {
            syncWorkspaceMember(before.projectId, before.personId);
            syncWorkspaceMember(row.projectId, row.personId);
        },
        afterDelete: row => syncWorkspaceMember(row.projectId, row.personId)
    }
};

function findById(entityKey, id) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId)) {
        return undefined;
    }
    return ENTITIES[entityKey].store.find(record => record.id === numericId);
}

// Readable name for a record, used anywhere an id would otherwise be shown
function displayOf(entityKey, id) {
    const record = findById(entityKey, id);
    return record ? ENTITIES[entityKey].display(record) : "—";
}

function nextId(store) {
    return store.reduce((max, record) => Math.max(max, record.id), 0) + 1;
}

function optionsFor(field) {
    if (field.options) {
        return field.options.map(option => ({ value: option, label: option }));
    }
    const ref = ENTITIES[field.ref];
    const records = ref.sort ? [...ref.store].sort(ref.sort) : ref.store;
    return records.map(record => ({ value: record.id, label: ref.display(record) }));
}

let fieldCounter = 0;

function renderField(field, value) {
    const id = `field-${field.name}-${++fieldCounter}`;
    const required = field.required ? " required" : "";
    const label = `${esc(field.label)}${field.required ? " *" : ""}`;

    switch (field.type) {
    case "textarea":
        return `<label for="${id}">${label}<textarea id="${id}" name="${esc(field.name)}" rows="3"${required}>${esc(value)}</textarea></label>`;
    case "select": {
        const blank = field.required ? `<option value="" disabled${value == null ? " selected" : ""}>Choose…</option>` : `<option value="">None</option>`;
        return `<label for="${id}">${label}<select id="${id}" name="${esc(field.name)}"${required}>${blank}${selectOptions(optionsFor(field), value)}</select></label>`;
    }
    case "multiselect":
        return `<label for="${id}">${label} <span class="muted">(Ctrl/Cmd-click to pick more than one)</span><select id="${id}" name="${esc(field.name)}" multiple size="5">${selectOptions(optionsFor(field), value)}</select></label>`;
    case "checkbox":
        return `<label class="check" for="${id}"><input id="${id}" type="checkbox" name="${esc(field.name)}" value="true"${value ? " checked" : ""}> ${label}</label>`;
    case "list":
        return `<label for="${id}">${label} <span class="muted">(comma separated)</span><input id="${id}" type="text" name="${esc(field.name)}" value="${esc([].concat(value ?? []).join(", "))}"${required}></label>`;
    case "address": {
        const address = value || {};
        const part = (key, placeholder) => `<input type="text" name="${esc(field.name)}[${key}]" placeholder="${placeholder}" aria-label="${placeholder}" value="${esc(address[key])}">`;
        return `<fieldset><legend>${label}</legend>${part("street", "Street")}${part("city", "City")}${part("state", "State")}${part("zip", "ZIP")}</fieldset>`;
    }
    case "datetime":
        return `<label for="${id}">${label}<input id="${id}" type="datetime-local" name="${esc(field.name)}" value="${esc(String(value ?? "").slice(0, 16))}"${required}></label>`;
    default: {
        const type = { number: "number", date: "date", email: "email", url: "text" }[field.type] || "text";
        const extra = field.type === "number" ? ` step="any"${field.min !== undefined ? ` min="${field.min}"` : ""}` : "";
        return `<label for="${id}">${label}<input id="${id}" type="${type}" name="${esc(field.name)}" value="${esc(value)}"${extra}${required}></label>`;
    }
    }
}

// A form built from an entity's fields. Pass omit to leave fields out.
function renderForm(entityKey, { action, record = {}, submitLabel = "Save", omit = [], hidden = {}, inModal = false }) {
    const fields = ENTITIES[entityKey].fields.filter(field => !omit.includes(field.name));
    return `<form method="POST" action="${esc(action)}" class="stack">
        ${hiddenInputs(hidden)}
        ${fields.map(field => renderField(field, record[field.name])).join("")}
        <div class="actions">
            <button type="submit">${esc(submitLabel)}</button>
            ${inModal ? `<button type="submit" formmethod="dialog" formnovalidate>Cancel</button>` : ""}
        </div>
    </form>`;
}

function isBlank(raw) {
    return raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "");
}

function parseValue(field, raw) {
    switch (field.type) {
    case "checkbox":
        return { value: raw === true || raw === "true" || raw === "on" };
    case "multiselect": {
        const list = isBlank(raw) ? [] : [].concat(raw);
        const ids = [...new Set(list.map(Number))];
        if (ids.some(id => !findById(field.ref, id))) {
            return { error: "contains a choice that doesn't exist" };
        }
        if (field.required && ids.length === 0) {
            return { error: "is required" };
        }
        return { value: ids };
    }
    case "list": {
        const list = Array.isArray(raw) ? raw : String(raw ?? "").split(",");
        const value = list.map(item => String(item).trim()).filter(Boolean);
        if (field.required && value.length === 0) {
            return { error: "is required" };
        }
        return { value };
    }
    case "address": {
        const source = raw && typeof raw === "object" ? raw : {};
        const part = key => (typeof source[key] === "string" ? source[key].trim() : "");
        return { value: { street: part("street"), city: part("city"), state: part("state"), zip: part("zip") } };
    }
    }

    if (isBlank(raw)) {
        return field.required ? { error: "is required" } : { value: null };
    }
    if (typeof raw === "object") {
        return { error: "must be a single value" };
    }

    const text = String(raw).trim();

    switch (field.type) {
    case "number": {
        const number = Number(text);
        if (!Number.isFinite(number)) {
            return { error: "must be a number" };
        }
        if (field.min !== undefined && number < field.min) {
            return { error: `must be at least ${field.min}` };
        }
        return { value: number };
    }
    case "date":
        if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(text))) {
            return { error: "must be a date (YYYY-MM-DD)" };
        }
        return { value: text };
    case "datetime":
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(text) || Number.isNaN(Date.parse(text))) {
            return { error: "must be a date and time (YYYY-MM-DDTHH:MM)" };
        }
        return { value: text.length === 16 ? `${text}:00` : text };
    case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
            return { error: "must be an email address" };
        }
        return { value: text };
    case "select":
        if (field.options) {
            return field.options.includes(text) ? { value: text } : { error: `must be one of: ${field.options.join(", ")}` };
        }
        return findById(field.ref, text) ? { value: Number(text) } : { error: "must be an existing choice" };
    default:
        return { value: text };
    }
}

// Turn submitted input into a clean record. With partial, fields that weren't
// sent are left alone (for API PATCH requests) instead of being cleared.
function parseRecord(entityKey, input = {}, { partial = false, omit = [] } = {}) {
    const data = {};
    const errors = [];
    for (const field of ENTITIES[entityKey].fields) {
        if (omit.includes(field.name) || (partial && input[field.name] === undefined)) {
            continue;
        }
        const result = parseValue(field, input[field.name]);
        if (result.error) {
            errors.push(`${field.label} ${result.error}`);
        } else {
            data[field.name] = result.value;
        }
    }
    return { data, errors };
}

// ----- Who changed what -----
// Every create, edit, and delete on a resource with recordActor set is
// attributed to the person on the session. Records carry who created and last
// changed them, and each change (deletes included) is kept in changeHistory.

const changeHistory = [];

// Fields whose values differ between two versions of a record
function changedFields(entityKey, before, after) {
    const changes = {};
    for (const field of ENTITIES[entityKey].fields) {
        if (JSON.stringify(before[field.name]) !== JSON.stringify(after[field.name])) {
            changes[field.name] = { from: before[field.name] ?? null, to: after[field.name] ?? null };
        }
    }
    return changes;
}

function recordChange(entityKey, action, record, actorId, changes) {
    const entity = ENTITIES[entityKey];
    if (!entity.recordActor) {
        return null;
    }
    const entry = {
        id: changeHistory.length + 1,
        entity: entityKey,
        recordId: record.id,
        action,
        summary: entity.display(record),
        actorPersonId: actorId ?? null,
        at: new Date().toISOString(),
        changes: changes || {}
    };
    changeHistory.push(entry);
    (CHANGE_LISTENERS[entityKey] || []).forEach(listener => listener(entry, record));
    return entry;
}

function stampCreated(entityKey, record, actorId) {
    if (ENTITIES[entityKey].recordActor) {
        const at = new Date().toISOString();
        record.audit = { createdBy: actorId ?? null, createdAt: at, updatedBy: actorId ?? null, updatedAt: at };
    }
}

function stampUpdated(entityKey, record, actorId) {
    if (ENTITIES[entityKey].recordActor) {
        record.audit = { ...record.audit, updatedBy: actorId ?? null, updatedAt: new Date().toISOString() };
    }
}

function createRecord(entityKey, data, actorId) {
    const entity = ENTITIES[entityKey];
    const defaults = entity.defaults ? entity.defaults(data) : {};
    const values = { ...data };
    for (const [key, value] of Object.entries(defaults)) {
        if (values[key] === null || values[key] === undefined) {
            values[key] = value;
        }
    }

    const errors = entity.validate ? entity.validate(values, null) : [];
    if (errors.length) {
        return { errors };
    }

    const record = { id: nextId(entity.store), ...values };
    stampCreated(entityKey, record, actorId);
    entity.store.push(record);
    recordChange(entityKey, "created", record, actorId);
    if (entity.afterCreate) {
        entity.afterCreate(record, { actorId });
    }
    return { record };
}

function updateRecord(entityKey, record, data, actorId) {
    const entity = ENTITIES[entityKey];
    const errors = entity.validate ? entity.validate({ ...record, ...data }, record) : [];
    if (errors.length) {
        return { errors };
    }

    const before = { ...record };
    Object.assign(record, data);
    const changes = changedFields(entityKey, before, record);
    if (Object.keys(changes).length) {
        stampUpdated(entityKey, record, actorId);
        recordChange(entityKey, "updated", record, actorId, changes);
    }
    if (entity.afterUpdate) {
        entity.afterUpdate(record, before, { actorId, changes });
    }
    return { record, before, changes };
}

// Records that belong to this one (cascade) are deleted with it, ids in
// multi-selects are pulled out, and anything else pointing at it blocks the delete.
function deleteRecord(entityKey, record, actorId) {
    const entity = ENTITIES[entityKey];
    const blockers = [];
    let blockingCount = 0;
    const dependents = [];

    for (const [otherKey, other] of Object.entries(ENTITIES)) {
        for (const field of other.fields.filter(f => f.ref === entityKey)) {
            if (field.type === "multiselect") {
                continue;
            }
            const matches = other.store.filter(row => row[field.name] === record.id);
            if (matches.length === 0) {
                continue;
            }
            if (field.cascade) {
                dependents.push(...matches.map(match => [otherKey, match]));
            } else {
                blockers.push(`${matches.length} ${matches.length === 1 ? other.label : other.plural}`);
                blockingCount += matches.length;
            }
        }
    }

    if (blockers.length) {
        return { errors: [`Can't delete ${entity.display(record)}: ${blockers.join(", ")} still ${blockingCount === 1 ? "refers" : "refer"} to this ${entity.label}.`] };
    }

    if (!entity.store.includes(record)) {
        return {};
    }

    // Children go first so their history entries can still name this record
    for (const [otherKey, dependent] of dependents) {
        deleteRecord(otherKey, dependent, actorId);
    }
    entity.store.splice(entity.store.indexOf(record), 1);
    recordChange(entityKey, "deleted", record, actorId);
    for (const other of Object.values(ENTITIES)) {
        for (const field of other.fields.filter(f => f.ref === entityKey && f.type === "multiselect")) {
            other.store.forEach(row => {
                row[field.name] = (row[field.name] || []).filter(id => id !== record.id);
            });
        }
    }

    if (entity.afterDelete) {
        entity.afterDelete(record, { actorId });
    }
    return {};
}


// ===== PROJECT WORKSPACES =====
// Moving a project card into "In Progress" on the main board spins up its
// workspace: a task board (its status columns) and a #general channel that
// every member of the project can use. Each step checks before it creates, so
// moving a project in and out of In Progress never duplicates anything.

function isInProgress(mainBoardStatusId) {
    const status = findById("mainBoardStatuses", mainBoardStatusId);
    return Boolean(status) && status.name.trim().toLowerCase() === "in progress";
}

function generalChannel(projectId) {
    return channels.find(channel => channel.projectId === projectId
        && (channel.name === "general" || channel.name.endsWith("-general")));
}

// Everyone who should have access to a project's workspace
function projectMemberIds(project) {
    const ids = projectPeople
        .filter(row => row.projectId === project.id && row.status !== "Completed" && row.status !== "Removed")
        .map(row => row.personId);
    if (project.projectManagerId) {
        ids.push(project.projectManagerId);
    }
    return [...new Set(ids)];
}

function initializeWorkspace(project, actorId) {
    // Default board columns, in the order the statuses are normally used
    if (!projectStatuses.some(row => row.projectId === project.id)) {
        [...statuses].sort(byOrder).forEach((status, index) => {
            projectStatuses.push({ id: nextId(projectStatuses), projectId: project.id, statusId: status.id, order: index + 1 });
        });
    }

    // The #general channel, with every project member in it
    const channel = generalChannel(project.id);
    if (channel) {
        channel.participantPersonIds = [...new Set([...channel.participantPersonIds, ...projectMemberIds(project)])];
    } else {
        const id = nextId(channels);
        channels.push({
            id,
            name: "general",
            type: "Team",
            url: `/channels/${id}`,
            projectId: project.id,
            participantPersonIds: projectMemberIds(project),
            createdDate: today()
        });
    }

    if (!project.workspaceInitializedAt) {
        project.workspaceInitializedAt = new Date().toISOString();
        recordChange("projects", "created the workspace for", project, actorId);
    }
}

// Keep a person's access to a project's #general channel in step with their assignment
function syncWorkspaceMember(projectId, personId) {
    const project = findById("projects", projectId);
    const channel = generalChannel(projectId);
    if (!project || !channel) {
        return;
    }
    const isMember = projectMemberIds(project).includes(personId);
    const hasAccess = channel.participantPersonIds.includes(personId);
    if (isMember && !hasAccess) {
        channel.participantPersonIds.push(personId);
    } else if (!isMember && hasAccess) {
        channel.participantPersonIds = channel.participantPersonIds.filter(id => id !== personId);
    }
}

function isDoneStatus(statusId) {
    const status = statuses.find(s => s.id === statusId);
    return Boolean(status) && status.name.trim().toLowerCase() === "done";
}

// Share of a project's requirements that are done, or null if it has none
function projectProgress(projectId) {
    const projectRequirements = requirements.filter(requirement => requirement.projectId === projectId);
    if (projectRequirements.length === 0) {
        return null;
    }
    const done = projectRequirements.filter(requirement => isDoneStatus(requirement.statusId)).length;
    return Math.round((done / projectRequirements.length) * 100);
}

// Marking a type primary on a project un-marks the project's other types
function keepOnePrimaryType(row) {
    if (row.isPrimary) {
        projectProjectTypes
            .filter(other => other !== row && other.projectId === row.projectId)
            .forEach(other => {
                other.isPrimary = false;
            });
    }
}

function projectTeam(projectId) {
    return projectPeople.filter(row => row.projectId === projectId && row.status !== "Removed");
}

// This is a server-rendered app, so browsers can only send GET and POST.
// Every resource follows the same pattern:
//   GET  /thing/new         -> create form       POST /thing/new         -> save new
//   GET  /thing/edit/:id    -> edit form         POST /thing/edit/:id    -> save edit
//                                                POST /thing/delete/:id  -> delete (confirmed on the frontend)
// Static paths (new, edit, all) must be registered before /:id so they aren't shadowed.


// ===== RESOURCE PAGES =====
// Most resources share one shape: a list page with a create modal, a page for
// one record, and an edit page. These build those pages from the registry.

// Plain-text version of a field's value, with ids turned into names
function fieldText(field, value) {
    switch (field.type) {
    case "select":
        return field.ref ? displayOf(field.ref, value) : value ?? "—";
    case "multiselect":
        return (value || []).map(id => displayOf(field.ref, id)).join(", ") || "—";
    case "checkbox":
        return value ? "Yes" : "No";
    case "list":
        return (value || []).join(", ") || "—";
    case "address":
        return value ? [value.street, value.city, [value.state, value.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ") || "—" : "—";
    case "datetime":
        return value ? String(value).replace("T", " ").slice(0, 16) : "—";
    default:
        return value === null || value === undefined || value === "" ? "—" : String(value);
    }
}

function auditLine(personId, at) {
    return `${displayOf("people", personId)}, ${String(at || "").replace("T", " ").slice(0, 16)}`;
}

function fieldByName(entityKey, name) {
    return ENTITIES[entityKey].fields.find(field => field.name === name);
}

// A table column that shows one field
function fieldColumn(entityKey, name, label) {
    const field = fieldByName(entityKey, name);
    return { label: label || field.label, value: row => fieldText(field, row[name]) };
}

function recordActions(entityKey, itemPath, record) {
    const label = ENTITIES[entityKey].display(record);
    return `${editButton(`${itemPath}/edit/${record.id}`, label)}${deleteButton(`${itemPath}/delete/${record.id}`, label)}`;
}

// Columns are { label, value(row) } for text or { label, html(row) } for markup
function recordTable(columns, rows, actions) {
    if (rows.length === 0) {
        return `<p class="muted">Nothing here yet.</p>`;
    }
    const head = columns.map(column => `<th>${esc(column.label)}</th>`).join("");
    const body = rows.map(row => `<tr>
        ${columns.map(column => `<td>${column.html ? column.html(row) : esc(column.value(row) ?? "—")}</td>`).join("")}
        <td class="row-actions">${actions ? actions(row) : ""}</td>
    </tr>`).join("");
    return `<table><thead><tr>${head}<th></th></tr></thead><tbody>${body}</tbody></table>`;
}

function createModal(entityKey, itemPath, { omit = [], hidden = {}, record = {} } = {}) {
    const entity = ENTITIES[entityKey];
    return modal(`create-${entityKey}`, `New ${entity.label}`,
        renderForm(entityKey, { action: `${itemPath}/new`, submitLabel: `Create ${entity.label}`, inModal: true, omit, hidden, record }));
}

// List page with a create modal. Pass body to replace the default table.
function sendListPage(res, { entityKey, title, itemPath, columns, rows, intro = "", body, createOptions }) {
    const entity = ENTITIES[entityKey];
    sendPage(res, title, `
        <div class="toolbar">
            <h1>${esc(title)}</h1>
            ${modalButton(`create-${entityKey}`, `+ New ${entity.label}`)}
        </div>
        ${intro}
        ${body ?? recordTable(columns, rows, row => recordActions(entityKey, itemPath, row))}
        ${createModal(entityKey, itemPath, createOptions)}
    `);
}

// Page for one record: every field, plus anything extra
function sendDetailPage(res, { entityKey, record, itemPath, listPath, extra = "" }) {
    const entity = ENTITIES[entityKey];
    const name = entity.display(record);
    const audit = record.audit
        ? `<dt>Created</dt><dd>${esc(auditLine(record.audit.createdBy, record.audit.createdAt))}</dd>
           <dt>Last changed</dt><dd>${esc(auditLine(record.audit.updatedBy, record.audit.updatedAt))}</dd>`
        : "";
    const rows = entity.fields
        .map(field => `<dt>${esc(field.label)}</dt><dd>${esc(fieldText(field, record[field.name]))}</dd>`)
        .join("") + audit;
    sendPage(res, name, `
        <div class="toolbar">
            <h1>${esc(name)}</h1>
            <div class="row-actions">${recordActions(entityKey, itemPath, record)}</div>
        </div>
        <section class="panel"><dl class="details">${rows}</dl></section>
        ${extra}
        <p><a href="${esc(listPath)}">Back to all ${esc(entity.plural)}</a></p>
    `);
}

function sendEditPage(res, { entityKey, record, itemPath, backHref, omit = [], intro = "" }) {
    const entity = ENTITIES[entityKey];
    const name = entity.display(record);
    sendPage(res, `Edit ${name}`, `
        <h1>Edit ${esc(entity.label)}: ${esc(name)}</h1>
        ${intro}
        <section class="panel">
            ${renderForm(entityKey, { action: `${itemPath}/edit/${record.id}`, record, omit, submitLabel: "Save changes" })}
        </section>
        <p><a href="${esc(backHref)}">Cancel</a></p>
    `);
}

// Shared POST handlers. Each takes the paths to send the user to afterwards.
function handleCreate(entityKey, req, res, { backHref, redirectTo, input = req.body, omit = [] }) {
    const { data, errors } = parseRecord(entityKey, input, { omit });
    const result = errors.length ? { errors } : createRecord(entityKey, data, actingPersonId(req));
    if (result.errors) {
        return sendErrors(res, result.errors, backHref);
    }
    flash(req, "success", `Created ${ENTITIES[entityKey].label} ${ENTITIES[entityKey].display(result.record)}.`);
    res.redirect(typeof redirectTo === "function" ? redirectTo(result.record) : redirectTo);
}

function handleUpdate(entityKey, req, res, { record, backHref, redirectTo, input = req.body, omit = [] }) {
    const { data, errors } = parseRecord(entityKey, input, { omit });
    const result = errors.length ? { errors } : updateRecord(entityKey, record, data, actingPersonId(req));
    if (result.errors) {
        return sendErrors(res, result.errors, backHref);
    }
    console.log(`Updated ${ENTITIES[entityKey].label} ${record.id}: ${ENTITIES[entityKey].display(record)}`);
    flash(req, "success", `Saved changes to ${ENTITIES[entityKey].display(record)}.`);
    res.redirect(typeof redirectTo === "function" ? redirectTo(record) : redirectTo);
}

function handleDelete(entityKey, req, res, { record, backHref, redirectTo }) {
    const result = deleteRecord(entityKey, record, actingPersonId(req));
    if (result.errors) {
        return sendErrors(res, result.errors, backHref);
    }
    flash(req, "success", `Deleted ${ENTITIES[entityKey].display(record)}.`);
    res.redirect(redirectTo);
}


// ===== ACTIVITY (Issue #97) =====
// Every recorded change, newest first, with the person who made it

NAV.push({ href: "/activity", label: "Activity" });

function activityList(entries) {
    if (entries.length === 0) {
        return `<p class="muted">No recorded changes yet.</p>`;
    }
    return `<ul>${entries.map(entry => {
        const changed = Object.keys(entry.changes || {});
        return `<li><span class="muted">${esc(entry.at.replace("T", " ").slice(0, 16))}</span>
            ${esc(displayOf("people", entry.actorPersonId))} ${esc(entry.action)}
            ${esc(ENTITIES[entry.entity].label)} <strong>${esc(entry.summary)}</strong>
            ${changed.length ? `<span class="muted">(${esc(changed.map(name => fieldByName(entry.entity, name)?.label || name).join(", "))})</span>` : ""}</li>`;
    }).join("")}</ul>`;
}

app.get("/activity", (req, res) => {
    const entityKey = ENTITIES[req.query.entity] ? req.query.entity : undefined;
    const entries = changeHistory.filter(entry => !entityKey || entry.entity === entityKey).slice().reverse();
    const tracked = Object.entries(ENTITIES).filter(([, entity]) => entity.recordActor)
        .map(([key, entity]) => ({ value: key, label: entity.plural }));
    sendPage(res, "Activity", `
        <h1>Activity</h1>
        <form method="GET" action="/activity" class="actions">
            <label>Show <select name="entity" onchange="this.form.submit()"><option value="">Everything</option>${selectOptions(tracked, entityKey)}</select></label>
            <noscript><button type="submit">Filter</button></noscript>
        </form>
        <section class="panel">${activityList(entries)}</section>
    `);
});


// ===== PROJECTS (Issues #1, #20) =====
// The main board: every project is a card in the column for its status.

app.get("/", (req, res) => {
    res.redirect("/projects");
});

function projectCard(project) {
    const team = projectTeam(project.id);
    const mentorNames = team.filter(row => row.role === "Faculty Mentor").map(row => displayOf("people", row.personId));
    const studentCount = team.filter(row => row.role === "Student").length;
    const progress = projectProgress(project.id);

    return `<article class="card">
        <h4><a href="/projects/${project.id}">${esc(project.name)}</a></h4>
        <p><span class="muted">Client:</span> ${esc(displayOf("clients", project.clientId))}</p>
        <p><span class="muted">Mentor:</span> ${esc(mentorNames.join(", ") || "—")}</p>
        <p><span class="muted">Team:</span> ${studentCount} student${studentCount === 1 ? "" : "s"}</p>
        ${progress === null ? "" : `<div class="progress" title="${progress}% of requirements done"><span style="width: ${progress}%"></span></div>`}
        <div class="row-actions">
            ${editButton(`/projects/edit/${project.id}`, project.name)}
            ${deleteButton(`/projects/delete/${project.id}`, project.name)}
        </div>
    </article>`;
}

// Get all projects as cards on the main board
app.get("/projects", (req, res) => {
    const columns = [...mainBoardStatuses].sort(byOrder).map(status => {
        const cards = projects.filter(project => project.mainBoardStatusId === status.id);
        return `<section class="column" aria-label="${esc(status.name)}">
            <h3>${esc(status.name)} <span class="count">${cards.length}</span></h3>
            ${cards.map(projectCard).join("") || `<p class="muted">No projects</p>`}
        </section>`;
    });

    sendPage(res, "Main board", `
        <div class="toolbar">
            <h1>Main board</h1>
            ${modalButton("create-project", "+ New project")}
        </div>
        <div class="board">${columns.join("")}</div>
        ${modal("create-project", "New project", renderForm("projects", { action: "/projects/new", submitLabel: "Create project", inModal: true }))}
    `);
});

// The create form lives in a modal on the board
app.get("/projects/new", (req, res) => {
    res.redirect("/projects");
});

// Save the new project from the create form
app.post("/projects/new", (req, res) => {
    const { data, errors } = parseRecord("projects", req.body);
    const result = errors.length ? { errors } : createRecord("projects", data, actingPersonId(req));
    if (result.errors) {
        return sendErrors(res, result.errors, "/projects");
    }
    flash(req, "success", `Created project ${result.record.name}.${result.record.workspaceInitializedAt ? " Its workspace is ready." : ""}`);
    res.redirect(`/projects/${result.record.id}`);
});

function assignmentModal(project, id, role, candidates) {
    const assigned = projectTeam(project.id).filter(row => row.role === role).map(row => row.personId);
    const options = candidates
        .filter(personId => !assigned.includes(personId))
        .map(personId => ({ value: personId, label: displayOf("people", personId) }));

    const form = options.length === 0
        ? `<p class="muted">Every ${esc(role.toLowerCase())} is already on this project.</p>
           <form method="dialog"><button type="submit" class="secondary">Close</button></form>`
        : `<form method="POST" action="/projects/${project.id}/people/new" class="stack">
            ${hiddenInputs({ role, returnTo: `/projects/edit/${project.id}` })}
            <label>${esc(role)}<select name="personId" required>${selectOptions(options)}</select></label>
            <div class="actions">
                <button type="submit">Add</button>
                <button type="submit" formmethod="dialog" formnovalidate>Cancel</button>
            </div>
        </form>`;
    return modal(id, `Add ${role.toLowerCase()}`, form);
}

// Get the edit page for one project
app.get("/projects/edit/:id", (req, res) => {
    const project = findById("projects", req.params.id);
    if (!project) {
        return sendNotFound(res, "project", req.params.id);
    }

    const statusOptions = [...mainBoardStatuses].sort(byOrder).map(status => ({ value: status.id, label: status.name }));
    const team = projectTeam(project.id);
    const teamRows = team.map(row => `<tr>
        <td>${esc(displayOf("people", row.personId))}</td>
        <td>${esc(row.role)}</td>
        <td>${esc(row.status)}</td>
        <td class="row-actions">${deleteButton(`/projects/${project.id}/people/delete/${row.id}`,
        `${displayOf("people", row.personId)} from this project`, { returnTo: `/projects/edit/${project.id}` })}</td>
    </tr>`).join("");

    sendPage(res, `Edit ${project.name}`, `
        <h1>Edit ${esc(project.name)}</h1>
        <section class="panel">
            <h2>Status</h2>
            <form method="POST" action="/projects/${project.id}/status">
                <label>Main board status
                    <select name="mainBoardStatusId" onchange="this.form.submit()">${selectOptions(statusOptions, project.mainBoardStatusId)}</select>
                </label>
                <noscript><button type="submit">Update status</button></noscript>
            </form>
            <p class="muted">Moving a project into In Progress sets up its workspace: a task board and a #general channel for the team.</p>
        </section>
        <section class="panel">
            <h2>Team</h2>
            <div class="actions">
                ${modalButton("add-mentor", "+ Add mentor", "secondary")}
                ${modalButton("add-student", "+ Add student", "secondary")}
            </div>
            ${team.length ? `<table><thead><tr><th>Name</th><th>Role</th><th>Status</th><th></th></tr></thead><tbody>${teamRows}</tbody></table>` : `<p class="muted">Nobody is assigned yet.</p>`}
        </section>
        <section class="panel">
            <h2>Details</h2>
            ${renderForm("projects", { action: `/projects/edit/${project.id}`, record: project, omit: ["mainBoardStatusId"], submitLabel: "Save changes" })}
        </section>
        <p><a href="/projects/${project.id}">Cancel</a></p>
        ${assignmentModal(project, "add-mentor", "Faculty Mentor", mentors.map(mentor => mentor.personId))}
        ${assignmentModal(project, "add-student", "Student", students.map(student => student.personId))}
    `);
});

// Save the edit form for one project
app.post("/projects/edit/:id", (req, res) => {
    const project = findById("projects", req.params.id);
    if (!project) {
        return sendNotFound(res, "project", req.params.id);
    }
    const { data, errors } = parseRecord("projects", req.body, { omit: ["mainBoardStatusId"] });
    const result = errors.length ? { errors } : updateRecord("projects", project, data, actingPersonId(req));
    if (result.errors) {
        return sendErrors(res, result.errors, `/projects/edit/${project.id}`);
    }
    flash(req, "success", `Saved changes to ${project.name}.`);
    res.redirect(`/projects/${project.id}`);
});

// Move a project to another column on the main board
app.post("/projects/:id/status", (req, res) => {
    const project = findById("projects", req.params.id);
    if (!project) {
        return sendNotFound(res, "project", req.params.id);
    }
    const { data, errors } = parseRecord("projects", { mainBoardStatusId: req.body.mainBoardStatusId }, { partial: true });
    if (data.mainBoardStatusId === undefined && errors.length === 0) {
        errors.push("Status is required");
    }
    const result = errors.length ? { errors } : updateRecord("projects", project, data, actingPersonId(req));
    if (result.errors) {
        return sendErrors(res, result.errors, `/projects/edit/${project.id}`);
    }
    const workspaceCreated = !result.before.workspaceInitializedAt && project.workspaceInitializedAt;
    flash(req, "success", `Moved ${project.name} to ${displayOf("mainBoardStatuses", project.mainBoardStatusId)}.${workspaceCreated ? " Its workspace is ready." : ""}`);
    res.redirect(`/projects/edit/${project.id}`);
});

// Delete one project by id, along with everything that belongs to it
app.post("/projects/delete/:id", (req, res) => {
    const project = findById("projects", req.params.id);
    if (!project) {
        return sendNotFound(res, "project", req.params.id);
    }
    const result = deleteRecord("projects", project, actingPersonId(req));
    if (result.errors) {
        return sendErrors(res, result.errors, "/projects");
    }
    flash(req, "success", `Deleted project ${project.name}.`);
    res.redirect("/projects");
});

// Get one project by id
app.get("/projects/:id", (req, res) => {
    const project = findById("projects", req.params.id);
    if (!project) {
        return sendNotFound(res, "project", req.params.id);
    }

    const team = projectTeam(project.id);
    const progress = projectProgress(project.id);
    const projectChannels = channels.filter(channel => channel.projectId === project.id);
    const projectDocuments = documents.filter(document => document.projectId === project.id);
    const columns = projectStatuses.filter(row => row.projectId === project.id).sort(byOrder);
    const hasWorkspace = Boolean(project.workspaceInitializedAt) || projectChannels.length > 0 || columns.length > 0;
    const money = value => (value == null ? "—" : `$${Number(value).toLocaleString("en-US")}`);

    const workspace = hasWorkspace
        ? `<p><a href="/requirements?projectId=${project.id}"><button type="button">Open the task board</button></a></p>
           <p><strong>Board columns:</strong> ${columns.map(row => `<span class="tag">${esc(displayOf("statuses", row.statusId))}</span>`).join(" ") || "—"}</p>
           <p><strong>Channels:</strong></p>
           <ul>${projectChannels.map(channel => `<li><a href="/channels/${channel.id}">#${esc(channel.name)}</a> <span class="muted">(${channel.participantPersonIds.length} member${channel.participantPersonIds.length === 1 ? "" : "s"})</span></li>`).join("") || "<li class=\"muted\">None</li>"}</ul>`
        : `<p class="muted">The workspace is created automatically when this project moves into In Progress.</p>`;

    sendPage(res, project.name, `
        <div class="toolbar">
            <h1>${esc(project.name)}</h1>
            <div class="row-actions">
                ${editButton(`/projects/edit/${project.id}`, project.name)}
                ${deleteButton(`/projects/delete/${project.id}`, project.name)}
            </div>
        </div>
        <section class="panel">
            <dl class="details">
                <dt>Status</dt><dd>${esc(displayOf("mainBoardStatuses", project.mainBoardStatusId))}</dd>
                <dt>Client</dt><dd>${esc(displayOf("clients", project.clientId))}</dd>
                <dt>Project manager</dt><dd>${esc(displayOf("people", project.projectManagerId))}</dd>
                <dt>Description</dt><dd>${esc(project.description || "—")}</dd>
                <dt>Start</dt><dd>${esc(project.startDate || "—")}</dd>
                <dt>Midpoint</dt><dd>${esc(project.midpointDate || "—")}</dd>
                <dt>End</dt><dd>${esc(project.endDate || "—")}</dd>
                <dt>Budget</dt><dd>${esc(money(project.budget))}</dd>
                <dt>Estimated hours</dt><dd>${esc(project.estimatedHours ?? "—")}</dd>
                <dt>Progress</dt><dd>${progress === null ? "No requirements yet" : `${progress}% of requirements done`}</dd>
                <dt>Notes</dt><dd>${esc(project.notes || "—")}</dd>
                ${project.audit ? `<dt>Created</dt><dd>${esc(auditLine(project.audit.createdBy, project.audit.createdAt))}</dd>
                <dt>Last changed</dt><dd>${esc(auditLine(project.audit.updatedBy, project.audit.updatedAt))}</dd>` : ""}
            </dl>
        </section>
        <section class="panel">
            <h2>Team</h2>
            ${team.length ? `<ul>${team.map(row => `<li>${esc(displayOf("people", row.personId))} <span class="muted">— ${esc(row.role)}</span></li>`).join("")}</ul>` : `<p class="muted">Nobody is assigned yet.</p>`}
        </section>
        <section class="panel">
            <h2>Workspace</h2>
            ${workspace}
        </section>
        <section class="panel">
            <h2>Recent activity</h2>
            ${activityList(changeHistory.filter(entry => entry.entity === "projects" && entry.recordId === project.id).slice(-10).reverse())}
            <p><a href="/activity">All activity</a></p>
        </section>
        <section class="panel">
            <h2>Documents</h2>
            ${projectDocuments.length
        ? `<ul>${projectDocuments.map(document => `<li><a href="/documents/${document.id}">${esc(document.name)}</a> <span class="muted">— v${esc(document.version)}, ${esc(document.status)}</span></li>`).join("")}</ul>`
        : `<p class="muted">No documents yet.</p>`}
            <p><a href="/documents?projectId=${project.id}">Manage documents</a></p>
        </section>
        <p><a href="/projects">Back to the main board</a></p>
    `);
});


// ===== STATUSES (Issues #2, #21) =====
// The task statuses that become the columns on a project workspace's board

NAV.push({ href: "/statuses", label: "Statuses" });

function nextOrder(store) {
    return store.reduce((max, row) => Math.max(max, row.order || 0), 0) + 1;
}

// View all statuses in board order
app.get("/statuses", (req, res) => {
    sendListPage(res, {
        entityKey: "statuses",
        title: "Statuses",
        itemPath: "/status",
        intro: `<p class="muted">Statuses are the columns on the task board inside each project workspace, listed here in board order.</p>`,
        columns: [
            fieldColumn("statuses", "order"),
            { label: "Name", html: status => `<a href="/status/${status.id}">${esc(status.name)}</a>` },
            fieldColumn("statuses", "description")
        ],
        rows: [...statuses].sort(byOrder)
    });
});

// The create form lives in a modal on the list page
app.get("/status/new", (req, res) => {
    res.redirect("/statuses");
});

app.post("/status/new", (req, res) => {
    handleCreate("statuses", req, res, { backHref: "/statuses", redirectTo: "/statuses" });
});

app.get("/status/edit/:id", (req, res) => {
    const status = findById("statuses", req.params.id);
    if (!status) {
        return sendNotFound(res, "status", req.params.id);
    }
    sendEditPage(res, { entityKey: "statuses", record: status, itemPath: "/status", backHref: "/statuses" });
});

app.post("/status/edit/:id", (req, res) => {
    const status = findById("statuses", req.params.id);
    if (!status) {
        return sendNotFound(res, "status", req.params.id);
    }
    handleUpdate("statuses", req, res, { record: status, backHref: `/status/edit/${status.id}`, redirectTo: "/statuses" });
});

app.post("/status/delete/:id", (req, res) => {
    const status = findById("statuses", req.params.id);
    if (!status) {
        return sendNotFound(res, "status", req.params.id);
    }
    handleDelete("statuses", req, res, { record: status, backHref: "/statuses", redirectTo: "/statuses" });
});

// View a specific status
app.get("/status/:id", (req, res) => {
    const status = findById("statuses", req.params.id);
    if (!status) {
        return sendNotFound(res, "status", req.params.id);
    }
    sendDetailPage(res, { entityKey: "statuses", record: status, itemPath: "/status", listPath: "/statuses" });
});


// ===== MAIN BOARD STATUSES (Issues #19, #23) =====
// The columns on the one main board that every project appears on as a card.
// These are separate from the task statuses used inside a project's own board.

NAV.push({ href: "/main-board-statuses", label: "Main board statuses" });

const IN_PROGRESS_NOTE = `<p class="muted">Moving a project into the column named <strong>In Progress</strong> is what sets up its workspace, so keep that name if you edit it.</p>`;

// The create form lives in a modal on the list page
app.get("/main-board-statuses/new", (req, res) => {
    res.redirect("/main-board-statuses");
});

app.post("/main-board-statuses/new", (req, res) => {
    handleCreate("mainBoardStatuses", req, res, { backHref: "/main-board-statuses", redirectTo: "/main-board-statuses" });
});

// View all main board statuses as columns in board order
app.get("/main-board-statuses", (req, res) => {
    const columns = [...mainBoardStatuses].sort(byOrder).map(status => {
        const count = projects.filter(project => project.mainBoardStatusId === status.id).length;
        return `<section class="column">
            <h3>
                <span><a href="/main-board-statuses/${status.id}">${esc(status.name)}</a> ${editButton(`/main-board-statuses/edit/${status.id}`, status.name)}</span>
                ${deleteButton(`/main-board-statuses/delete/${status.id}`, status.name)}
            </h3>
            <p class="muted">${esc(status.description)}</p>
            <p class="count">Column ${esc(status.order)} · ${count} project${count === 1 ? "" : "s"}</p>
        </section>`;
    });
    sendListPage(res, {
        entityKey: "mainBoardStatuses",
        title: "Main board statuses",
        itemPath: "/main-board-statuses",
        intro: IN_PROGRESS_NOTE,
        body: `<div class="board">${columns.join("")}</div>`
    });
});

app.get("/main-board-statuses/edit/:id", (req, res) => {
    const status = findById("mainBoardStatuses", req.params.id);
    if (!status) {
        return sendNotFound(res, "main board status", req.params.id);
    }
    sendEditPage(res, { entityKey: "mainBoardStatuses", record: status, itemPath: "/main-board-statuses", backHref: "/main-board-statuses", intro: IN_PROGRESS_NOTE });
});

app.post("/main-board-statuses/edit/:id", (req, res) => {
    const status = findById("mainBoardStatuses", req.params.id);
    if (!status) {
        return sendNotFound(res, "main board status", req.params.id);
    }
    handleUpdate("mainBoardStatuses", req, res, { record: status, backHref: `/main-board-statuses/edit/${status.id}`, redirectTo: "/main-board-statuses" });
});

// Remove a status from the main board (only once no project sits in it)
app.post("/main-board-statuses/delete/:id", (req, res) => {
    const status = findById("mainBoardStatuses", req.params.id);
    if (!status) {
        return sendNotFound(res, "main board status", req.params.id);
    }
    handleDelete("mainBoardStatuses", req, res, { record: status, backHref: "/main-board-statuses", redirectTo: "/main-board-statuses" });
});

app.get("/main-board-statuses/:id", (req, res) => {
    const status = findById("mainBoardStatuses", req.params.id);
    if (!status) {
        return sendNotFound(res, "main board status", req.params.id);
    }
    const cards = projects.filter(project => project.mainBoardStatusId === status.id);
    sendDetailPage(res, {
        entityKey: "mainBoardStatuses",
        record: status,
        itemPath: "/main-board-statuses",
        listPath: "/main-board-statuses",
        extra: `<section class="panel"><h2>Projects in this column</h2>${cards.length
            ? `<ul>${cards.map(project => `<li><a href="/projects/${project.id}">${esc(project.name)}</a></li>`).join("")}</ul>`
            : `<p class="muted">None</p>`}</section>`
    });
});


// ===== PROJECT STATUSES (Issues #3, #22) =====
// Associates statuses with a specific project. A project's associations, in
// order, are the columns on the task board in its workspace.

NAV.push({ href: "/project-statuses", label: "Project statuses" });

function projectStatusColumns() {
    return [
        { label: "Project", html: row => `<a href="/projects/${row.projectId}/statuses">${esc(displayOf("projects", row.projectId))}</a>` },
        { label: "Status", html: row => `<a href="/projects/${row.projectId}/statuses/${row.id}">${esc(displayOf("statuses", row.statusId))}</a>` },
        fieldColumn("projectStatuses", "order", "Column order")
    ];
}

function projectStatusActions(row) {
    return recordActions("projectStatuses", `/projects/${row.projectId}/statuses`, row);
}

function sortedProjectStatuses(rows) {
    return [...rows].sort((a, b) => a.projectId - b.projectId || a.order - b.order);
}

function findProjectStatus(req) {
    const row = findById("projectStatuses", req.params.id);
    return row && row.projectId === Number(req.params.projectid) ? row : undefined;
}

// View every project status association
app.get("/project-statuses", (req, res) => {
    sendListPage(res, {
        entityKey: "projectStatuses",
        title: "Project statuses",
        itemPath: "/project-statuses",
        intro: `<p class="muted">Each project picks its own statuses. In order, they are the columns on that project's task board.</p>`,
        body: recordTable(projectStatusColumns(), sortedProjectStatuses(projectStatuses), projectStatusActions)
    });
});

// Save an association picked from the project and status dropdowns
app.post("/project-statuses/new", (req, res) => {
    handleCreate("projectStatuses", req, res, { backHref: "/project-statuses", redirectTo: "/project-statuses" });
});

// View all statuses used by a project
app.get("/projects/:projectid/statuses", (req, res) => {
    const project = findById("projects", req.params.projectid);
    if (!project) {
        return sendNotFound(res, "project", req.params.projectid);
    }
    sendListPage(res, {
        entityKey: "projectStatuses",
        title: `Statuses for ${project.name}`,
        itemPath: `/projects/${project.id}/statuses`,
        intro: `<p><a href="/projects/${project.id}">Back to ${esc(project.name)}</a> · <a href="/project-statuses">All project statuses</a></p>`,
        body: recordTable(projectStatusColumns(), sortedProjectStatuses(projectStatuses.filter(row => row.projectId === project.id)), projectStatusActions),
        createOptions: { omit: ["projectId"] }
    });
});

// The create form lives in a modal on the list page
app.get("/projects/:projectid/statuses/new", (req, res) => {
    res.redirect(`/projects/${req.params.projectid}/statuses`);
});

// Save a status added to a project
app.post("/projects/:projectid/statuses/new", (req, res) => {
    const project = findById("projects", req.params.projectid);
    if (!project) {
        return sendNotFound(res, "project", req.params.projectid);
    }
    const back = `/projects/${project.id}/statuses`;
    handleCreate("projectStatuses", req, res, { input: { ...req.body, projectId: project.id }, backHref: back, redirectTo: back });
});

// Form to update a project's status (e.g. its order in the workflow)
app.get("/projects/:projectid/statuses/edit/:id", (req, res) => {
    const row = findProjectStatus(req);
    if (!row) {
        return sendNotFound(res, "project status association", req.params.id);
    }
    sendEditPage(res, { entityKey: "projectStatuses", record: row, itemPath: `/projects/${row.projectId}/statuses`, backHref: `/projects/${row.projectId}/statuses` });
});

// Save the updated project status
app.post("/projects/:projectid/statuses/edit/:id", (req, res) => {
    const row = findProjectStatus(req);
    if (!row) {
        return sendNotFound(res, "project status association", req.params.id);
    }
    handleUpdate("projectStatuses", req, res, {
        record: row,
        backHref: `/projects/${row.projectId}/statuses/edit/${row.id}`,
        redirectTo: saved => `/projects/${saved.projectId}/statuses`
    });
});

// Remove a status from a project
app.post("/projects/:projectid/statuses/delete/:id", (req, res) => {
    const row = findProjectStatus(req);
    if (!row) {
        return sendNotFound(res, "project status association", req.params.id);
    }
    handleDelete("projectStatuses", req, res, { record: row, backHref: `/projects/${row.projectId}/statuses`, redirectTo: `/projects/${row.projectId}/statuses` });
});

// View one status association on a project
app.get("/projects/:projectid/statuses/:id", (req, res) => {
    const row = findProjectStatus(req);
    if (!row) {
        return sendNotFound(res, "project status association", req.params.id);
    }
    sendDetailPage(res, { entityKey: "projectStatuses", record: row, itemPath: `/projects/${row.projectId}/statuses`, listPath: "/project-statuses" });
});


// ===== PROJECT PEOPLE (Issues #12, #27) =====
// Associates people (mentors and students) with a specific project. These
// rows decide who gets access to a project's workspace. The add mentor / add
// student modals on the project edit page write the same kind of record.

NAV.push({ href: "/project-people", label: "Project people" });

function projectPersonColumns() {
    return [
        { label: "Project", html: row => `<a href="/projects/${row.projectId}/people">${esc(displayOf("projects", row.projectId))}</a>` },
        { label: "Person", html: row => `<a href="/projects/${row.projectId}/people/${row.id}">${esc(displayOf("people", row.personId))}</a>` },
        fieldColumn("projectPeople", "role"),
        fieldColumn("projectPeople", "status"),
        { label: "Dates", value: row => `${row.startDate || "?"} to ${row.endDate || "?"}` },
        fieldColumn("projectPeople", "assignedHours", "Hours")
    ];
}

function projectPersonActions(row) {
    return recordActions("projectPeople", `/projects/${row.projectId}/people`, row);
}

function sortedProjectPeople(rows) {
    return [...rows].sort((a, b) => a.projectId - b.projectId
        || PROJECT_ROLES.indexOf(a.role) - PROJECT_ROLES.indexOf(b.role)
        || displayOf("people", a.personId).localeCompare(displayOf("people", b.personId)));
}

function findProjectPerson(req, res) {
    const row = findById("projectPeople", req.params.id);
    if (!row || row.projectId !== Number(req.params.projectid)) {
        sendNotFound(res, "project person association", req.params.id);
        return undefined;
    }
    return row;
}

// Standalone admin view of every association
app.get("/project-people", (req, res) => {
    sendListPage(res, {
        entityKey: "projectPeople",
        title: "Project people",
        itemPath: "/project-people",
        intro: `<p class="muted">Everyone listed on a project can reach that project's workspace once it is set up.</p>`,
        body: recordTable(projectPersonColumns(), sortedProjectPeople(projectPeople), projectPersonActions)
    });
});

// Save an association picked from the project and person dropdowns
app.post("/project-people/new", (req, res) => {
    handleCreate("projectPeople", req, res, { backHref: "/project-people", redirectTo: "/project-people" });
});

// View all people associated with a project
app.get("/projects/:projectid/people", (req, res) => {
    const project = findById("projects", req.params.projectid);
    if (!project) {
        return sendNotFound(res, "project", req.params.projectid);
    }
    sendListPage(res, {
        entityKey: "projectPeople",
        title: `People on ${project.name}`,
        itemPath: `/projects/${project.id}/people`,
        intro: `<p><a href="/projects/${project.id}">Back to ${esc(project.name)}</a> · <a href="/project-people">All project people</a></p>`,
        body: recordTable(projectPersonColumns(), sortedProjectPeople(projectPeople.filter(row => row.projectId === project.id)), projectPersonActions),
        createOptions: { omit: ["projectId"] }
    });
});

// The create form lives in a modal on the list page
app.get("/projects/:projectid/people/new", (req, res) => {
    res.redirect(`/projects/${req.params.projectid}/people`);
});

// Save new relationship (also used by the add mentor / add student modals on the project edit page)
app.post("/projects/:projectid/people/new", (req, res) => {
    const project = findById("projects", req.params.projectid);
    if (!project) {
        return sendNotFound(res, "project", req.params.projectid);
    }
    const { data, errors } = parseRecord("projectPeople", { ...req.body, projectId: project.id });
    const result = errors.length ? { errors } : createRecord("projectPeople", data, actingPersonId(req));
    if (result.errors) {
        return sendErrors(res, result.errors, `/projects/edit/${project.id}`);
    }
    flash(req, "success", `Added ${displayOf("people", result.record.personId)} to ${project.name} as ${result.record.role}.`);
    redirectBack(res, req.body.returnTo, `/projects/${project.id}/people`);
});

// Form to edit a relationship
app.get("/projects/:projectid/people/edit/:id", (req, res) => {
    const row = findProjectPerson(req, res);
    if (row) {
        sendEditPage(res, { entityKey: "projectPeople", record: row, itemPath: `/projects/${row.projectId}/people`, backHref: `/projects/${row.projectId}/people` });
    }
});

// Save edited relationship
app.post("/projects/:projectid/people/edit/:id", (req, res) => {
    const row = findProjectPerson(req, res);
    if (row) {
        handleUpdate("projectPeople", req, res, {
            record: row,
            backHref: `/projects/${row.projectId}/people/edit/${row.id}`,
            redirectTo: saved => `/projects/${saved.projectId}/people`
        });
    }
});

// Delete a relationship
app.post("/projects/:projectid/people/delete/:id", (req, res) => {
    const row = findProjectPerson(req, res);
    if (row) {
        deleteRecord("projectPeople", row, actingPersonId(req));
        flash(req, "success", `Removed ${displayOf("people", row.personId)} from ${displayOf("projects", row.projectId)}.`);
        redirectBack(res, req.body.returnTo, `/projects/${row.projectId}/people`);
    }
});

// View a specific relationship
app.get("/projects/:projectid/people/:id", (req, res) => {
    const row = findProjectPerson(req, res);
    if (row) {
        sendDetailPage(res, { entityKey: "projectPeople", record: row, itemPath: `/projects/${row.projectId}/people`, listPath: "/project-people" });
    }
});


// ===== MENTORS (Issues #4, #25) =====
// A mentor is a person plus the mentor-only details. Deleting a mentor
// removes the mentor record and leaves the person alone.

NAV.push({ href: "/mentors", label: "Mentors" });

function findMentor(req, res) {
    const mentor = findById("mentors", req.params.id);
    if (!mentor) {
        sendNotFound(res, "mentor", req.params.id);
    }
    return mentor;
}

// Projects the person is actively mentoring right now
function currentMentorLoad(personId) {
    return projectPeople.filter(row => row.personId === personId && row.role === "Faculty Mentor" && row.status === "Active").length;
}

// The create form lives in a modal on the list page
app.get("/mentors/new", (req, res) => {
    res.redirect("/mentors");
});

app.post("/mentors/new", (req, res) => {
    handleCreate("mentors", req, res, { backHref: "/mentors", redirectTo: mentor => `/mentors/${mentor.id}` });
});

app.get("/mentors", (req, res) => {
    sendListPage(res, {
        entityKey: "mentors",
        title: "Mentors",
        itemPath: "/mentors",
        intro: `<p class="muted">To add a mentor, pick someone from People and fill in their mentor details. Add them to <a href="/people">People</a> first if they aren't there yet.</p>`,
        columns: [
            { label: "Name", html: mentor => `<a href="/mentors/${mentor.id}">${esc(ENTITIES.mentors.display(mentor))}</a>` },
            fieldColumn("mentors", "department"),
            { label: "Project load", value: mentor => `${currentMentorLoad(mentor.personId)} of ${mentor.maxProjectLoad ?? "—"}` },
            fieldColumn("mentors", "skillIds")
        ],
        rows: [...mentors].sort((a, b) => ENTITIES.mentors.display(a).localeCompare(ENTITIES.mentors.display(b)))
    });
});

app.get("/mentors/edit/:id", (req, res) => {
    const mentor = findMentor(req, res);
    if (mentor) {
        sendEditPage(res, { entityKey: "mentors", record: mentor, itemPath: "/mentors", backHref: `/mentors/${mentor.id}` });
    }
});

app.post("/mentors/edit/:id", (req, res) => {
    const mentor = findMentor(req, res);
    if (mentor) {
        handleUpdate("mentors", req, res, { record: mentor, backHref: `/mentors/edit/${mentor.id}`, redirectTo: `/mentors/${mentor.id}` });
    }
});

app.post("/mentors/delete/:id", (req, res) => {
    const mentor = findMentor(req, res);
    if (mentor) {
        handleDelete("mentors", req, res, { record: mentor, backHref: `/mentors/${mentor.id}`, redirectTo: "/mentors" });
    }
});

app.get("/mentors/:id", (req, res) => {
    const mentor = findMentor(req, res);
    if (!mentor) {
        return;
    }
    const person = findById("people", mentor.personId);
    const mentoring = projectPeople.filter(row => row.personId === mentor.personId && row.role === "Faculty Mentor");
    sendDetailPage(res, {
        entityKey: "mentors",
        record: mentor,
        itemPath: "/mentors",
        listPath: "/mentors",
        extra: `<section class="panel">
            <h2>Contact</h2>
            <p>${person ? `<a href="/people/${person.id}">${esc(person.email)}</a> · ${esc(person.phone || "no phone")}` : "—"}</p>
            <h2>Projects mentored</h2>
            ${mentoring.length
        ? `<ul>${mentoring.map(row => `<li><a href="/projects/${row.projectId}">${esc(displayOf("projects", row.projectId))}</a> <span class="muted">— ${esc(row.status)}</span></li>`).join("")}</ul>`
        : `<p class="muted">None yet.</p>`}
        </section>`
    });
});


// ===== STUDENTS (Issues #5, #26) =====
// A student is a person plus the student-only details. Deleting a student
// removes the student record and leaves the person alone.

NAV.push({ href: "/students", label: "Students" });

function findStudent(req, res) {
    const student = findById("students", req.params.id);
    if (!student) {
        sendNotFound(res, "student", req.params.id);
    }
    return student;
}

// The create form lives in a modal on the list page
app.get("/students/new", (req, res) => {
    res.redirect("/students");
});

app.post("/students/new", (req, res) => {
    handleCreate("students", req, res, { backHref: "/students", redirectTo: student => `/students/${student.id}` });
});

app.get("/students", (req, res) => {
    sendListPage(res, {
        entityKey: "students",
        title: "Students",
        itemPath: "/students",
        intro: `<p class="muted">To add a student, pick someone from People and fill in their student details. Add them to <a href="/people">People</a> first if they aren't there yet.</p>`,
        columns: [
            { label: "Name", html: student => `<a href="/students/${student.id}">${esc(ENTITIES.students.display(student))}</a>` },
            fieldColumn("students", "major"),
            fieldColumn("students", "workApprovalStatus", "Work approval"),
            { label: "Hours / week", value: student => `${student.minHoursPerWeek ?? "?"}–${student.maxHoursPerWeek ?? "?"}` },
            fieldColumn("students", "graduationDate", "Graduates")
        ],
        rows: [...students].sort((a, b) => ENTITIES.students.display(a).localeCompare(ENTITIES.students.display(b)))
    });
});

app.get("/students/edit/:id", (req, res) => {
    const student = findStudent(req, res);
    if (student) {
        sendEditPage(res, { entityKey: "students", record: student, itemPath: "/students", backHref: `/students/${student.id}` });
    }
});

app.post("/students/edit/:id", (req, res) => {
    const student = findStudent(req, res);
    if (student) {
        handleUpdate("students", req, res, { record: student, backHref: `/students/edit/${student.id}`, redirectTo: `/students/${student.id}` });
    }
});

app.post("/students/delete/:id", (req, res) => {
    const student = findStudent(req, res);
    if (student) {
        handleDelete("students", req, res, { record: student, backHref: `/students/${student.id}`, redirectTo: "/students" });
    }
});

app.get("/students/:id", (req, res) => {
    const student = findStudent(req, res);
    if (!student) {
        return;
    }
    const person = findById("people", student.personId);
    const work = projectPeople.filter(row => row.personId === student.personId && row.role === "Student");
    sendDetailPage(res, {
        entityKey: "students",
        record: student,
        itemPath: "/students",
        listPath: "/students",
        extra: `<section class="panel">
            <h2>Contact</h2>
            <p>${person ? `<a href="/people/${person.id}">${esc(person.email)}</a> · ${esc(person.phone || "no phone")}` : "—"}</p>
            <h2>Projects</h2>
            ${work.length
        ? `<ul>${work.map(row => `<li><a href="/projects/${row.projectId}">${esc(displayOf("projects", row.projectId))}</a> <span class="muted">— ${esc(row.status)}, ${esc(row.assignedHours ?? 0)} hours</span></li>`).join("")}</ul>`
        : `<p class="muted">None yet.</p>`}
        </section>`
    });
});


// ===== COMMUNICATION CHANNELS (Issues #6, #35) =====
// The Slack-style half of a project workspace. Most channels are created
// automatically when a project moves into In Progress; creating one here is
// the admin override for adding an extra channel to a workspace.

NAV.push({ href: "/channels/all", label: "Channels" });

function findChannel(req, res) {
    const channel = findById("channels", req.params.id);
    if (!channel) {
        sendNotFound(res, "channel", req.params.id);
    }
    return channel;
}

// View all communication channels
app.get("/channels/all", (req, res) => {
    sendListPage(res, {
        entityKey: "channels",
        title: "Channels",
        itemPath: "/channels",
        intro: `<p class="muted">Each project's #general channel is created with its workspace when the project moves into In Progress. Use New channel to add another one to a project.</p>`,
        columns: [
            { label: "Channel", html: channel => `<a href="/channels/${channel.id}">#${esc(channel.name)}</a>` },
            { label: "Project", html: channel => `<a href="/projects/${channel.projectId}">${esc(displayOf("projects", channel.projectId))}</a>` },
            fieldColumn("channels", "type"),
            { label: "Members", value: channel => channel.participantPersonIds.length }
        ],
        rows: [...channels].sort((a, b) => a.projectId - b.projectId || a.name.localeCompare(b.name))
    });
});

// The create form lives in a modal on the list page
app.get("/channels/new", (req, res) => {
    res.redirect("/channels/all");
});

// Save a new communication channel
app.post("/channels/new", (req, res) => {
    handleCreate("channels", req, res, { backHref: "/channels/all", redirectTo: channel => `/channels/${channel.id}` });
});

// Edit a specific communication channel
app.get("/channels/edit/:id", (req, res) => {
    const channel = findChannel(req, res);
    if (channel) {
        sendEditPage(res, { entityKey: "channels", record: channel, itemPath: "/channels", backHref: `/channels/${channel.id}` });
    }
});

// Save the edited communication channel
app.post("/channels/edit/:id", (req, res) => {
    const channel = findChannel(req, res);
    if (channel) {
        handleUpdate("channels", req, res, { record: channel, backHref: `/channels/edit/${channel.id}`, redirectTo: `/channels/${channel.id}` });
    }
});

// Delete a specific communication channel
app.post("/channels/delete/:id", (req, res) => {
    const channel = findChannel(req, res);
    if (channel) {
        handleDelete("channels", req, res, { record: channel, backHref: `/channels/${channel.id}`, redirectTo: "/channels/all" });
    }
});

// View a specific communication channel
app.get("/channels/:id", (req, res) => {
    const channel = findChannel(req, res);
    if (!channel) {
        return;
    }
    const members = channel.participantPersonIds.map(id => displayOf("people", id)).sort();
    sendDetailPage(res, {
        entityKey: "channels",
        record: channel,
        itemPath: "/channels",
        listPath: "/channels/all",
        extra: `<section class="panel"><h2>Members</h2>${members.length
            ? `<ul>${members.map(name => `<li>${esc(name)}</li>`).join("")}</ul>`
            : `<p class="muted">No members.</p>`}</section>`
    });
});


// ===== THREADS (Issues #7, #36) =====
// Conversations inside a channel. This is chat UI rather than an admin
// screen: create is a modal, a thread is renamed by double-clicking its name,
// and there is no separate edit page.

NAV.push({ href: "/threads", label: "Threads" });

function findThread(req, res) {
    const thread = findById("threads", req.params.id);
    if (!thread) {
        sendNotFound(res, "thread", req.params.id);
    }
    return thread;
}

function threadMessageCount(threadId) {
    return messages.filter(message => message.threadId === threadId).length;
}

// Double-click a thread name to rename it. A single click still opens the
// thread, just a moment later so a double-click can cancel it.
const THREAD_RENAME_SCRIPT = `<script>
    document.querySelectorAll("[data-rename]").forEach(link => {
        const form = document.getElementById(link.dataset.rename);
        let timer;
        link.addEventListener("click", event => {
            event.preventDefault();
            clearTimeout(timer);
            if (event.detail === 1) {
                timer = setTimeout(() => { window.location.href = link.href; }, 250);
            }
        });
        link.addEventListener("dblclick", event => {
            event.preventDefault();
            clearTimeout(timer);
            link.hidden = true;
            form.hidden = false;
            form.querySelector("input").select();
        });
        form.querySelector("[data-cancel]").addEventListener("click", () => {
            form.hidden = true;
            link.hidden = false;
        });
    });
</script>`;

function threadItem(thread) {
    const count = threadMessageCount(thread.id);
    return `<li class="thread">
        <a class="thread-link" href="/threads/${thread.id}" data-rename="rename-${thread.id}" title="Double-click to rename">${esc(thread.name)}</a>
        <form id="rename-${thread.id}" class="inline" method="POST" action="/threads/edit/${thread.id}" hidden>
            <input type="text" name="name" value="${esc(thread.name)}" required aria-label="Thread name">
            <button type="submit">Save</button>
            <button type="button" class="secondary" data-cancel>Cancel</button>
        </form>
        <span class="muted">${count} message${count === 1 ? "" : "s"} · last active ${esc(fieldText({ type: "datetime" }, thread.lastActivityAt))}</span>
        ${deleteButton(`/threads/delete/${thread.id}`, `the thread "${thread.name}"`)}
    </li>`;
}

// The create form lives in a modal on the list page
app.get("/threads/new", (req, res) => {
    res.redirect("/threads");
});

app.post("/threads/new", (req, res) => {
    handleCreate("threads", req, res, {
        input: { ...req.body, createdByPersonId: actingPersonId(req) },
        backHref: "/threads",
        redirectTo: thread => `/threads/${thread.id}`
    });
});

// View all threads, grouped by channel, most recently active first
app.get("/threads", (req, res) => {
    const channel = req.query.channelId ? findById("channels", req.query.channelId) : undefined;
    const shownChannels = channel ? [channel] : [...channels].sort((a, b) => a.projectId - b.projectId || a.name.localeCompare(b.name));
    const groups = shownChannels.map(shown => {
        const channelThreads = threads
            .filter(thread => thread.channelId === shown.id)
            .sort((a, b) => String(b.lastActivityAt).localeCompare(String(a.lastActivityAt)));
        return `<section class="panel">
            <h2><a href="/channels/${shown.id}">${esc(ENTITIES.channels.display(shown))}</a> <span class="muted">· ${esc(displayOf("projects", shown.projectId))}</span></h2>
            ${channelThreads.length ? `<ul class="threads">${channelThreads.map(threadItem).join("")}</ul>` : `<p class="muted">No threads yet.</p>`}
        </section>`;
    });

    sendListPage(res, {
        entityKey: "threads",
        title: channel ? `Threads in ${ENTITIES.channels.display(channel)}` : "Threads",
        itemPath: "/threads",
        intro: `<p class="muted">Double-click a thread's name to rename it.</p>`,
        body: groups.join("") + THREAD_RENAME_SCRIPT,
        createOptions: { omit: ["createdByPersonId", "createdAt", "lastActivityAt"], record: { channelId: channel?.id } }
    });
});

// Threads are renamed in place, so there's no edit page to show
app.get("/threads/edit/:id", (req, res) => {
    res.redirect("/threads");
});

// Rename a thread
app.post("/threads/edit/:id", (req, res) => {
    const thread = findThread(req, res);
    if (thread) {
        handleUpdate("threads", req, res, {
            record: thread,
            input: { ...thread, name: req.body.name },
            backHref: "/threads",
            redirectTo: `/threads?channelId=${thread.channelId}`
        });
    }
});

app.post("/threads/delete/:id", (req, res) => {
    const thread = findThread(req, res);
    if (thread) {
        handleDelete("threads", req, res, { record: thread, backHref: "/threads", redirectTo: `/threads?channelId=${thread.channelId}` });
    }
});

app.get("/threads/:id", (req, res) => {
    const thread = findThread(req, res);
    if (!thread) {
        return;
    }
    const count = threadMessageCount(thread.id);
    sendPage(res, thread.name, `
        <div class="toolbar">
            <h1>${esc(thread.name)}</h1>
            ${deleteButton(`/threads/delete/${thread.id}`, `the thread "${thread.name}"`)}
        </div>
        <section class="panel">
            <dl class="details">
                <dt>Channel</dt><dd><a href="/channels/${thread.channelId}">${esc(displayOf("channels", thread.channelId))}</a></dd>
                <dt>Started by</dt><dd>${esc(displayOf("people", thread.createdByPersonId))}</dd>
                <dt>Started</dt><dd>${esc(fieldText({ type: "datetime" }, thread.createdAt))}</dd>
                <dt>Last active</dt><dd>${esc(fieldText({ type: "datetime" }, thread.lastActivityAt))}</dd>
                <dt>Messages</dt><dd>${count}</dd>
            </dl>
        </section>
        <p><a href="/messages?threadId=${thread.id}"><button type="button">Open the conversation</button></a></p>
        <p><a href="/threads?channelId=${thread.channelId}">Back to the channel's threads</a></p>
    `);
});


// ===== MESSAGES (Issues #8, #37) =====
// Chat inside a thread. Posting happens in the textbox under the
// conversation, editing happens in place, and only the sender of a message
// can edit or delete it.

NAV.push({ href: "/messages", label: "Messages" });

function findMessage(req, res) {
    const message = findById("messages", req.params.id);
    if (!message) {
        sendNotFound(res, "message", req.params.id);
    }
    return message;
}

// Only the sender may change or remove a message
function requireSender(req, res, message) {
    if (message.senderPersonId !== actingPersonId(req)) {
        sendPage(res, "Not allowed", `<h1>Not allowed</h1><p>Only the person who sent a message can change or delete it.</p><p><a href="/messages?threadId=${message.threadId}">Back to the conversation</a></p>`, 403);
        return false;
    }
    return true;
}

function messageBubble(message, currentId) {
    const isMine = message.senderPersonId === currentId;
    const edited = message.editedAt ? ` <span class="muted" title="Edited ${esc(fieldText({ type: "datetime" }, message.editedAt))}">(edited)</span>` : "";
    const controls = isMine
        ? `<div class="row-actions">
            <details class="edit-in-place">
                <summary class="icon-btn" title="Edit message" aria-label="Edit message">Edit</summary>
                <form method="POST" action="/messages/edit/${message.id}" class="stack">
                    <textarea name="body" rows="3" required aria-label="Message">${esc(message.body)}</textarea>
                    <div class="actions"><button type="submit">Save</button></div>
                </form>
            </details>
            ${deleteButton(`/messages/delete/${message.id}`, "this message")}
        </div>`
        : "";
    return `<article class="msg${isMine ? " mine" : ""}" id="message-${message.id}">
        <header><strong>${esc(displayOf("people", message.senderPersonId))}</strong>
            <span class="muted">${esc(fieldText({ type: "datetime" }, message.postedAt))}</span>${edited}</header>
        <p>${esc(message.body)}</p>
        ${controls}
    </article>`;
}

function conversation(threadMessages, currentId) {
    const ordered = [...threadMessages].sort((a, b) => String(a.postedAt).localeCompare(String(b.postedAt)));
    return ordered.length
        ? `<div class="chat">${ordered.map(message => messageBubble(message, currentId)).join("")}</div>`
        : `<p class="muted">No messages yet. Say hello below.</p>`;
}

// View all messages, a conversation per thread. ?threadId= shows one thread
// with the textbox for posting to it.
app.get("/messages", (req, res) => {
    const currentId = actingPersonId(req);
    const thread = req.query.threadId ? findById("threads", req.query.threadId) : undefined;
    if (req.query.threadId && !thread) {
        return sendNotFound(res, "thread", req.query.threadId);
    }

    if (thread) {
        return sendPage(res, thread.name, `
            <h1>${esc(thread.name)}</h1>
            <p class="muted"><a href="/channels/${thread.channelId}">${esc(displayOf("channels", thread.channelId))}</a> · <a href="/threads?channelId=${thread.channelId}">All threads in this channel</a></p>
            <section class="panel">
                ${conversation(messages.filter(message => message.threadId === thread.id), currentId)}
                <form method="POST" action="/messages/new" class="composer">
                    ${hiddenInputs({ threadId: thread.id })}
                    <textarea name="body" rows="2" placeholder="Write a message…" required aria-label="New message"></textarea>
                    <button type="submit">Send</button>
                </form>
            </section>
        `);
    }

    const threadsWithMessages = threads
        .filter(candidate => messages.some(message => message.threadId === candidate.id))
        .sort((a, b) => String(b.lastActivityAt).localeCompare(String(a.lastActivityAt)));
    sendPage(res, "Messages", `
        <h1>Messages</h1>
        <p class="muted">Every conversation, most recently active first. Open a thread to post in it.</p>
        ${threadsWithMessages.map(shown => `<section class="panel">
            <h2><a href="/messages?threadId=${shown.id}">${esc(shown.name)}</a> <span class="muted">· ${esc(displayOf("channels", shown.channelId))}</span></h2>
            ${conversation(messages.filter(message => message.threadId === shown.id), currentId)}
        </section>`).join("") || `<p class="muted">No messages yet.</p>`}
    `);
});

// Messages are written in the textbox under a conversation
app.get("/messages/new", (req, res) => {
    res.redirect("/messages");
});

app.post("/messages/new", (req, res) => {
    const thread = findById("threads", req.body.threadId);
    if (!thread) {
        return sendErrors(res, ["Pick a thread to post in"], "/messages");
    }
    handleCreate("messages", req, res, {
        input: { threadId: thread.id, channelId: thread.channelId, senderPersonId: actingPersonId(req), body: req.body.body, postedAt: nowStamp() },
        backHref: `/messages?threadId=${thread.id}`,
        redirectTo: message => `/messages?threadId=${thread.id}#message-${message.id}`
    });
});

// Editing happens in place on the conversation
app.get("/messages/edit/:id", (req, res) => {
    const message = findMessage(req, res);
    if (message) {
        res.redirect(`/messages?threadId=${message.threadId}#message-${message.id}`);
    }
});

app.post("/messages/edit/:id", (req, res) => {
    const message = findMessage(req, res);
    if (message && requireSender(req, res, message)) {
        handleUpdate("messages", req, res, {
            record: message,
            input: { ...message, body: req.body.body, editedAt: nowStamp() },
            backHref: `/messages?threadId=${message.threadId}`,
            redirectTo: `/messages?threadId=${message.threadId}#message-${message.id}`
        });
    }
});

app.post("/messages/delete/:id", (req, res) => {
    const message = findMessage(req, res);
    if (message && requireSender(req, res, message)) {
        handleDelete("messages", req, res, { record: message, backHref: `/messages?threadId=${message.threadId}`, redirectTo: `/messages?threadId=${message.threadId}` });
    }
});

app.get("/messages/:id", (req, res) => {
    const message = findMessage(req, res);
    if (message) {
        sendPage(res, "Message", `
            <h1>Message</h1>
            <section class="panel">${messageBubble(message, actingPersonId(req))}</section>
            <p><a href="/messages?threadId=${message.threadId}">Open the conversation</a></p>
        `);
    }
});


// ===== REQUIREMENTS (Issues #9, #38) =====
// Requirements are the tasks on a project workspace's board. Each card sits
// in the column for its status.

NAV.push({ href: "/requirements", label: "Requirements" });

function findRequirement(req, res) {
    const requirement = findById("requirements", req.params.id);
    if (!requirement) {
        sendNotFound(res, "requirement", req.params.id);
    }
    return requirement;
}

// A project's columns in order, plus any status its cards use that the
// project hasn't set up, so no card is ever hidden
function boardColumns(projectId, cards) {
    const ids = projectId
        ? projectStatuses.filter(row => row.projectId === projectId).sort(byOrder).map(row => row.statusId)
        : [...statuses].sort(byOrder).map(status => status.id);
    const extra = [...new Set(cards.map(card => card.statusId))]
        .filter(id => !ids.includes(id))
        .sort((a, b) => (findById("statuses", a)?.order ?? 0) - (findById("statuses", b)?.order ?? 0));
    return [...ids, ...extra].map(id => findById("statuses", id)).filter(Boolean);
}

function requirementCard(requirement, showProject) {
    return `<article class="card">
        <h4><a href="/requirements/${requirement.id}">${esc(requirement.title)}</a></h4>
        ${showProject ? `<p><span class="muted">Project:</span> ${esc(displayOf("projects", requirement.projectId))}</p>` : ""}
        <p><span class="muted">Assigned:</span> ${esc(displayOf("people", requirement.assignedPersonId))}</p>
        <p><span class="tag">${esc(requirement.priority || "No priority")}</span> ${requirement.dueDate ? `<span class="muted">due ${esc(requirement.dueDate)}</span>` : ""}</p>
        <div class="row-actions">${recordActions("requirements", "/requirements", requirement)}</div>
    </article>`;
}

// The create form lives in a modal on the board
app.get("/requirements/new", (req, res) => {
    res.redirect("/requirements");
});

app.post("/requirements/new", (req, res) => {
    handleCreate("requirements", req, res, {
        backHref: "/requirements",
        redirectTo: requirement => `/requirements?projectId=${requirement.projectId}`
    });
});

// View all requirements as cards on a board, or one project's board with ?projectId=
app.get("/requirements", (req, res) => {
    const project = req.query.projectId ? findById("projects", req.query.projectId) : undefined;
    if (req.query.projectId && !project) {
        return sendNotFound(res, "project", req.query.projectId);
    }
    const cards = requirements.filter(requirement => !project || requirement.projectId === project.id);
    const columns = boardColumns(project?.id, cards).map(status => {
        const inColumn = cards.filter(card => card.statusId === status.id);
        return `<section class="column" aria-label="${esc(status.name)}">
            <h3>${esc(status.name)} <span class="count">${inColumn.length}</span></h3>
            ${inColumn.map(card => requirementCard(card, !project)).join("") || `<p class="muted">No cards</p>`}
        </section>`;
    });
    const projectFilter = `<form method="GET" action="/requirements" class="actions">
        <label>Project board <select name="projectId" onchange="this.form.submit()"><option value="">All projects</option>${selectOptions(optionsFor(fieldByName("requirements", "projectId")), project?.id)}</select></label>
        <noscript><button type="submit">Show</button></noscript>
    </form>`;
    const firstColumn = project ? boardColumns(project.id, cards)[0] : undefined;

    sendListPage(res, {
        entityKey: "requirements",
        title: project ? `${project.name} board` : "Requirements",
        itemPath: "/requirements",
        intro: projectFilter + (project ? `<p><a href="/projects/${project.id}">Back to ${esc(project.name)}</a></p>` : ""),
        body: `<div class="board">${columns.join("")}</div>`,
        createOptions: { record: { projectId: project?.id, statusId: firstColumn?.id } }
    });
});

app.get("/requirements/edit/:id", (req, res) => {
    const requirement = findRequirement(req, res);
    if (!requirement) {
        return;
    }
    const statusOptions = boardColumns(requirement.projectId, [requirement]).map(status => ({ value: status.id, label: status.name }));
    sendEditPage(res, {
        entityKey: "requirements",
        record: requirement,
        itemPath: "/requirements",
        backHref: `/requirements/${requirement.id}`,
        omit: ["statusId"],
        intro: `<section class="panel">
            <h2>Status</h2>
            <form method="POST" action="/requirements/${requirement.id}/status">
                <label>Column on the board
                    <select name="statusId" onchange="this.form.submit()">${selectOptions(statusOptions, requirement.statusId)}</select>
                </label>
                <noscript><button type="submit">Update status</button></noscript>
            </form>
        </section>`
    });
});

app.post("/requirements/edit/:id", (req, res) => {
    const requirement = findRequirement(req, res);
    if (requirement) {
        handleUpdate("requirements", req, res, {
            record: requirement,
            omit: ["statusId"],
            backHref: `/requirements/edit/${requirement.id}`,
            redirectTo: `/requirements/${requirement.id}`
        });
    }
});

// Move a card to another column
app.post("/requirements/:id/status", (req, res) => {
    const requirement = findRequirement(req, res);
    if (requirement) {
        handleUpdate("requirements", req, res, {
            record: requirement,
            input: { ...requirement, statusId: req.body.statusId },
            backHref: `/requirements/edit/${requirement.id}`,
            redirectTo: `/requirements/edit/${requirement.id}`
        });
    }
});

app.post("/requirements/delete/:id", (req, res) => {
    const requirement = findRequirement(req, res);
    if (requirement) {
        handleDelete("requirements", req, res, {
            record: requirement,
            backHref: `/requirements/${requirement.id}`,
            redirectTo: `/requirements?projectId=${requirement.projectId}`
        });
    }
});

app.get("/requirements/:id", (req, res) => {
    const requirement = findRequirement(req, res);
    if (requirement) {
        sendDetailPage(res, {
            entityKey: "requirements",
            record: requirement,
            itemPath: "/requirements",
            listPath: `/requirements?projectId=${requirement.projectId}`
        });
    }
});


// ===== SKILLS (Issues #10, #28) =====

NAV.push({ href: "/skills", label: "Skills" });

function findSkill(req, res) {
    const skill = findById("skills", req.params.id);
    if (!skill) {
        sendNotFound(res, "skill", req.params.id);
    }
    return skill;
}

// The create form lives in a modal on the list page
app.get("/skills/new", (req, res) => {
    res.redirect("/skills");
});

app.post("/skills/new", (req, res) => {
    handleCreate("skills", req, res, { backHref: "/skills", redirectTo: "/skills" });
});

// View all skills grouped by category
app.get("/skills", (req, res) => {
    const categories = [...new Set(skills.map(skill => skill.category))].sort();
    const columns = [
        { label: "Name", html: skill => `<a href="/skills/${skill.id}">${esc(skill.name)}</a>` },
        fieldColumn("skills", "description")
    ];
    const groups = categories.map(category => `<section class="panel">
        <h2>${esc(category)}</h2>
        ${recordTable(columns, skills.filter(skill => skill.category === category).sort((a, b) => a.name.localeCompare(b.name)),
        skill => recordActions("skills", "/skills", skill))}
    </section>`);
    sendListPage(res, {
        entityKey: "skills",
        title: "Skills",
        itemPath: "/skills",
        body: groups.join("") || `<p class="muted">Nothing here yet.</p>`
    });
});

app.get("/skills/edit/:id", (req, res) => {
    const skill = findSkill(req, res);
    if (skill) {
        sendEditPage(res, { entityKey: "skills", record: skill, itemPath: "/skills", backHref: `/skills/${skill.id}` });
    }
});

app.post("/skills/edit/:id", (req, res) => {
    const skill = findSkill(req, res);
    if (skill) {
        handleUpdate("skills", req, res, { record: skill, backHref: `/skills/edit/${skill.id}`, redirectTo: `/skills/${skill.id}` });
    }
});

app.post("/skills/delete/:id", (req, res) => {
    const skill = findSkill(req, res);
    if (skill) {
        handleDelete("skills", req, res, { record: skill, backHref: `/skills/${skill.id}`, redirectTo: "/skills" });
    }
});

app.get("/skills/:id", (req, res) => {
    const skill = findSkill(req, res);
    if (!skill) {
        return;
    }
    const holders = [
        ...mentors.filter(mentor => (mentor.skillIds || []).includes(skill.id)).map(mentor => `${displayOf("people", mentor.personId)} (mentor)`),
        ...students.filter(student => (student.skillIds || []).includes(skill.id)).map(student => `${displayOf("people", student.personId)} (student)`)
    ];
    sendDetailPage(res, {
        entityKey: "skills",
        record: skill,
        itemPath: "/skills",
        listPath: "/skills",
        extra: `<section class="panel"><h2>Mentors and students with this skill</h2>${holders.length
            ? `<ul>${holders.map(name => `<li>${esc(name)}</li>`).join("")}</ul>`
            : `<p class="muted">Nobody yet.</p>`}</section>`
    });
});


// ===== PROJECT SKILLS (Issues #11, #29) =====
// The skills a project needs, and how much it needs them

NAV.push({ href: "/project-skills", label: "Project skills" });

function findProjectSkill(req, res) {
    const row = findById("projectSkills", req.params.id);
    if (!row) {
        sendNotFound(res, "project skill association", req.params.id);
    }
    return row;
}

// The create form lives in a modal on the list page
app.get("/project-skills/new", (req, res) => {
    res.redirect("/project-skills");
});

app.post("/project-skills/new", (req, res) => {
    handleCreate("projectSkills", req, res, { backHref: "/project-skills", redirectTo: "/project-skills" });
});

app.get("/project-skills", (req, res) => {
    sendListPage(res, {
        entityKey: "projectSkills",
        title: "Project skills",
        itemPath: "/project-skills",
        columns: [
            { label: "Project", html: row => `<a href="/projects/${row.projectId}">${esc(displayOf("projects", row.projectId))}</a>` },
            { label: "Skill", html: row => `<a href="/project-skills/${row.id}">${esc(displayOf("skills", row.skillId))}</a>` },
            fieldColumn("projectSkills", "importance"),
            fieldColumn("projectSkills", "minimumProficiency")
        ],
        rows: [...projectSkills].sort((a, b) => a.projectId - b.projectId
            || a.importance.localeCompare(b.importance) || displayOf("skills", a.skillId).localeCompare(displayOf("skills", b.skillId)))
    });
});

app.get("/project-skills/edit/:id", (req, res) => {
    const row = findProjectSkill(req, res);
    if (row) {
        sendEditPage(res, { entityKey: "projectSkills", record: row, itemPath: "/project-skills", backHref: "/project-skills" });
    }
});

app.post("/project-skills/edit/:id", (req, res) => {
    const row = findProjectSkill(req, res);
    if (row) {
        handleUpdate("projectSkills", req, res, { record: row, backHref: `/project-skills/edit/${row.id}`, redirectTo: "/project-skills" });
    }
});

app.post("/project-skills/delete/:id", (req, res) => {
    const row = findProjectSkill(req, res);
    if (row) {
        handleDelete("projectSkills", req, res, { record: row, backHref: "/project-skills", redirectTo: "/project-skills" });
    }
});

app.get("/project-skills/:id", (req, res) => {
    const row = findProjectSkill(req, res);
    if (row) {
        sendDetailPage(res, { entityKey: "projectSkills", record: row, itemPath: "/project-skills", listPath: "/project-skills" });
    }
});


// ===== PERSON SKILLS (Issues #13, #30) =====
// The skills each person has, and how well

NAV.push({ href: "/person-skill/all", label: "Person skills" });

function findPersonSkill(req, res) {
    const row = findById("personSkills", req.params.id);
    if (!row) {
        sendNotFound(res, "person skill association", req.params.id);
    }
    return row;
}

// The create form lives in a modal on the list page
app.get("/person-skill/new", (req, res) => {
    res.redirect("/person-skill/all");
});

app.post("/person-skill/new", (req, res) => {
    handleCreate("personSkills", req, res, { backHref: "/person-skill/all", redirectTo: "/person-skill/all" });
});

app.get("/person-skill/all", (req, res) => {
    sendListPage(res, {
        entityKey: "personSkills",
        title: "Person skills",
        itemPath: "/person-skill",
        columns: [
            { label: "Person", html: row => `<a href="/people/${row.personId}">${esc(displayOf("people", row.personId))}</a>` },
            { label: "Skill", html: row => `<a href="/person-skill/${row.id}">${esc(displayOf("skills", row.skillId))}</a>` },
            fieldColumn("personSkills", "proficiency"),
            { label: "Experience", value: row => (row.yearsExperience == null ? "—" : `${row.yearsExperience} year${row.yearsExperience === 1 ? "" : "s"}`) },
            fieldColumn("personSkills", "lastUsed")
        ],
        rows: [...personSkills].sort((a, b) => displayOf("people", a.personId).localeCompare(displayOf("people", b.personId))
            || displayOf("skills", a.skillId).localeCompare(displayOf("skills", b.skillId)))
    });
});

app.get("/person-skill/edit/:id", (req, res) => {
    const row = findPersonSkill(req, res);
    if (row) {
        sendEditPage(res, { entityKey: "personSkills", record: row, itemPath: "/person-skill", backHref: "/person-skill/all" });
    }
});

app.post("/person-skill/edit/:id", (req, res) => {
    const row = findPersonSkill(req, res);
    if (row) {
        handleUpdate("personSkills", req, res, { record: row, backHref: `/person-skill/edit/${row.id}`, redirectTo: "/person-skill/all" });
    }
});

app.post("/person-skill/delete/:id", (req, res) => {
    const row = findPersonSkill(req, res);
    if (row) {
        handleDelete("personSkills", req, res, { record: row, backHref: "/person-skill/all", redirectTo: "/person-skill/all" });
    }
});

app.get("/person-skill/:id", (req, res) => {
    const row = findPersonSkill(req, res);
    if (row) {
        sendDetailPage(res, { entityKey: "personSkills", record: row, itemPath: "/person-skill", listPath: "/person-skill/all" });
    }
});


// ===== PROJECT TYPES (Issues #14, #31) =====
// Categories for the kind of work a project involves

NAV.push({ href: "/project-types", label: "Project types" });

function findProjectType(req, res) {
    const type = findById("projectTypes", req.params.id);
    if (!type) {
        sendNotFound(res, "project type", req.params.id);
    }
    return type;
}

// The create form lives in a modal on the list page
app.get("/project-types/new", (req, res) => {
    res.redirect("/project-types");
});

app.post("/project-types/new", (req, res) => {
    handleCreate("projectTypes", req, res, { backHref: "/project-types", redirectTo: "/project-types" });
});

app.get("/project-types", (req, res) => {
    sendListPage(res, {
        entityKey: "projectTypes",
        title: "Project types",
        itemPath: "/project-types",
        columns: [
            { label: "Name", html: type => `<a href="/project-types/${type.id}">${esc(type.name)}</a>` },
            fieldColumn("projectTypes", "description"),
            { label: "Typical length", value: type => (type.typicalDurationWeeks == null ? "—" : `${type.typicalDurationWeeks} weeks`) },
            fieldColumn("projectTypes", "typicalSkillIds", "Typical skills")
        ],
        rows: [...projectTypes].sort((a, b) => a.name.localeCompare(b.name))
    });
});

app.get("/project-types/edit/:id", (req, res) => {
    const type = findProjectType(req, res);
    if (type) {
        sendEditPage(res, { entityKey: "projectTypes", record: type, itemPath: "/project-types", backHref: `/project-types/${type.id}` });
    }
});

app.post("/project-types/edit/:id", (req, res) => {
    const type = findProjectType(req, res);
    if (type) {
        handleUpdate("projectTypes", req, res, { record: type, backHref: `/project-types/edit/${type.id}`, redirectTo: `/project-types/${type.id}` });
    }
});

app.post("/project-types/delete/:id", (req, res) => {
    const type = findProjectType(req, res);
    if (type) {
        handleDelete("projectTypes", req, res, { record: type, backHref: `/project-types/${type.id}`, redirectTo: "/project-types" });
    }
});

app.get("/project-types/:id", (req, res) => {
    const type = findProjectType(req, res);
    if (type) {
        sendDetailPage(res, { entityKey: "projectTypes", record: type, itemPath: "/project-types", listPath: "/project-types" });
    }
});


// ===== PROJECT TYPE ASSOCIATIONS (Issues #15, #32) =====
// Associates project types with a specific project (many-to-many). One type
// per project can be marked primary.

NAV.push({ href: "/project-project-types", label: "Project type links" });

function findProjectProjectType(req, res) {
    const row = findById("projectProjectTypes", req.params.id);
    if (!row) {
        sendNotFound(res, "project type association", req.params.id);
    }
    return row;
}

// The create form lives in a modal on the list page
app.get("/project-project-types/new", (req, res) => {
    res.redirect("/project-project-types");
});

app.post("/project-project-types/new", (req, res) => {
    handleCreate("projectProjectTypes", req, res, { backHref: "/project-project-types", redirectTo: "/project-project-types" });
});

app.get("/project-project-types", (req, res) => {
    sendListPage(res, {
        entityKey: "projectProjectTypes",
        title: "Project type associations",
        itemPath: "/project-project-types",
        columns: [
            { label: "Project", html: row => `<a href="/projects/${row.projectId}">${esc(displayOf("projects", row.projectId))}</a>` },
            { label: "Project type", html: row => `<a href="/project-project-types/${row.id}">${esc(displayOf("projectTypes", row.projectTypeId))}</a>` },
            { label: "Primary", html: row => (row.isPrimary ? `<span class="tag">Primary</span>` : "") }
        ],
        rows: [...projectProjectTypes].sort((a, b) => a.projectId - b.projectId || Number(b.isPrimary) - Number(a.isPrimary))
    });
});

app.get("/project-project-types/edit/:id", (req, res) => {
    const row = findProjectProjectType(req, res);
    if (row) {
        sendEditPage(res, { entityKey: "projectProjectTypes", record: row, itemPath: "/project-project-types", backHref: "/project-project-types" });
    }
});

app.post("/project-project-types/edit/:id", (req, res) => {
    const row = findProjectProjectType(req, res);
    if (row) {
        handleUpdate("projectProjectTypes", req, res, { record: row, backHref: `/project-project-types/edit/${row.id}`, redirectTo: "/project-project-types" });
    }
});

app.post("/project-project-types/delete/:id", (req, res) => {
    const row = findProjectProjectType(req, res);
    if (row) {
        handleDelete("projectProjectTypes", req, res, { record: row, backHref: "/project-project-types", redirectTo: "/project-project-types" });
    }
});

app.get("/project-project-types/:id", (req, res) => {
    const row = findProjectProjectType(req, res);
    if (row) {
        sendDetailPage(res, { entityKey: "projectProjectTypes", record: row, itemPath: "/project-project-types", listPath: "/project-project-types" });
    }
});


// ===== CLIENTS (Issues #16, #33) =====
// The organizations and individuals who request projects from the ASC

NAV.push({ href: "/clients/all", label: "Clients" });

function findClient(req, res) {
    const client = findById("clients", req.params.id);
    if (!client) {
        sendNotFound(res, "client", req.params.id);
    }
    return client;
}

// View all clients
app.get("/clients/all", (req, res) => {
    sendListPage(res, {
        entityKey: "clients",
        title: "Clients",
        itemPath: "/clients",
        columns: [
            { label: "Name", html: client => `<a href="/clients/${client.id}">${esc(client.name)}</a>` },
            fieldColumn("clients", "type"),
            { label: "Contact", html: client => `${esc(client.contactPersonName || "—")}${client.contactEmail ? `<br><a href="mailto:${esc(client.contactEmail)}">${esc(client.contactEmail)}</a>` : ""}` },
            { label: "Projects", value: client => projects.filter(project => project.clientId === client.id).length }
        ],
        rows: [...clients].sort((a, b) => a.name.localeCompare(b.name))
    });
});

// The create form lives in a modal on the list page
app.get("/clients/new", (req, res) => {
    res.redirect("/clients/all");
});

// Form submission for creating a new client
app.post("/clients/new", (req, res) => {
    handleCreate("clients", req, res, { backHref: "/clients/all", redirectTo: client => `/clients/${client.id}` });
});

// Edit client page by id
app.get("/clients/edit/:id", (req, res) => {
    const client = findClient(req, res);
    if (client) {
        sendEditPage(res, { entityKey: "clients", record: client, itemPath: "/clients", backHref: `/clients/${client.id}` });
    }
});

// Save edited client
app.post("/clients/edit/:id", (req, res) => {
    const client = findClient(req, res);
    if (client) {
        handleUpdate("clients", req, res, { record: client, backHref: `/clients/edit/${client.id}`, redirectTo: `/clients/${client.id}` });
    }
});

// Delete client (only once none of its projects remain)
app.post("/clients/delete/:id", (req, res) => {
    const client = findClient(req, res);
    if (client) {
        handleDelete("clients", req, res, { record: client, backHref: `/clients/${client.id}`, redirectTo: "/clients/all" });
    }
});

// View a specific client
app.get("/clients/:id", (req, res) => {
    const client = findClient(req, res);
    if (!client) {
        return;
    }
    const clientProjects = projects.filter(project => project.clientId === client.id);
    sendDetailPage(res, {
        entityKey: "clients",
        record: client,
        itemPath: "/clients",
        listPath: "/clients/all",
        extra: `<section class="panel"><h2>Projects</h2>${clientProjects.length
            ? `<ul>${clientProjects.map(project => `<li><a href="/projects/${project.id}">${esc(project.name)}</a> <span class="muted">— ${esc(displayOf("mainBoardStatuses", project.mainBoardStatusId))}</span></li>`).join("")}</ul>`
            : `<p class="muted">No projects yet.</p>`}</section>`
    });
});


// ===== DOCUMENTS (Issues #17, #34) =====
// Documents always belong to a project. There's no real upload yet, so the
// file name and URL are plain text fields.

NAV.push({ href: "/documents", label: "Documents" });

function findDocument(req, res) {
    const document = findById("documents", req.params.id);
    if (!document) {
        sendNotFound(res, "document", req.params.id);
    }
    return document;
}

// The create form lives in a modal on the list page
app.get("/documents/new", (req, res) => {
    res.redirect("/documents");
});

app.post("/documents/new", (req, res) => {
    // Whoever adds a document is its uploader unless someone else is picked
    handleCreate("documents", req, res, {
        input: { ...req.body, personId: req.body.personId || actingPersonId(req) },
        backHref: "/documents",
        redirectTo: document => `/documents?projectId=${document.projectId}`
    });
});

// View all documents, or one project's with ?projectId=
app.get("/documents", (req, res) => {
    const project = req.query.projectId ? findById("projects", req.query.projectId) : undefined;
    const rows = documents
        .filter(document => !project || document.projectId === project.id)
        .sort((a, b) => a.projectId - b.projectId || String(b.uploadedDate).localeCompare(String(a.uploadedDate)));
    const projectFilter = `<form method="GET" action="/documents" class="actions">
        <label>Project <select name="projectId" onchange="this.form.submit()"><option value="">All projects</option>${selectOptions(optionsFor(fieldByName("documents", "projectId")), project?.id)}</select></label>
        <noscript><button type="submit">Filter</button></noscript>
    </form>`;

    sendListPage(res, {
        entityKey: "documents",
        title: project ? `Documents for ${project.name}` : "Documents",
        itemPath: "/documents",
        intro: projectFilter,
        columns: [
            { label: "Name", html: document => `<a href="/documents/${document.id}">${esc(document.name)}</a>` },
            { label: "Project", html: document => `<a href="/projects/${document.projectId}">${esc(displayOf("projects", document.projectId))}</a>` },
            fieldColumn("documents", "version"),
            fieldColumn("documents", "status"),
            fieldColumn("documents", "uploadedDate", "Uploaded")
        ],
        rows,
        createOptions: { record: { projectId: project?.id } }
    });
});

app.get("/documents/edit/:id", (req, res) => {
    const document = findDocument(req, res);
    if (document) {
        sendEditPage(res, { entityKey: "documents", record: document, itemPath: "/documents", backHref: `/documents/${document.id}` });
    }
});

app.post("/documents/edit/:id", (req, res) => {
    const document = findDocument(req, res);
    if (document) {
        handleUpdate("documents", req, res, { record: document, backHref: `/documents/edit/${document.id}`, redirectTo: `/documents/${document.id}` });
    }
});

app.post("/documents/delete/:id", (req, res) => {
    const document = findDocument(req, res);
    if (document) {
        handleDelete("documents", req, res, { record: document, backHref: `/documents/${document.id}`, redirectTo: `/documents?projectId=${document.projectId}` });
    }
});

app.get("/documents/:id", (req, res) => {
    const document = findDocument(req, res);
    if (document) {
        sendDetailPage(res, { entityKey: "documents", record: document, itemPath: "/documents", listPath: "/documents" });
    }
});


// ===== PEOPLE (Issues #18, #24) =====
// Everyone involved with ASC projects. Mentors and students point at a person.

NAV.push({ href: "/people", label: "People" });

function findPerson(req, res) {
    const person = findById("people", req.params.id);
    if (!person) {
        sendNotFound(res, "person", req.params.id);
    }
    return person;
}

// The create form lives in a modal on the list page
app.get("/people/new", (req, res) => {
    res.redirect("/people");
});

app.post("/people/new", (req, res) => {
    handleCreate("people", req, res, { backHref: "/people", redirectTo: person => `/people/${person.id}` });
});

app.get("/people", (req, res) => {
    sendListPage(res, {
        entityKey: "people",
        title: "People",
        itemPath: "/people",
        columns: [
            { label: "Name", html: person => `<a href="/people/${person.id}">${esc(ENTITIES.people.display(person))}</a>` },
            fieldColumn("people", "email"),
            fieldColumn("people", "phone")
        ],
        rows: [...people].sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName))
    });
});

app.get("/people/edit/:id", (req, res) => {
    const person = findPerson(req, res);
    if (person) {
        sendEditPage(res, { entityKey: "people", record: person, itemPath: "/people", backHref: `/people/${person.id}` });
    }
});

app.post("/people/edit/:id", (req, res) => {
    const person = findPerson(req, res);
    if (person) {
        handleUpdate("people", req, res, { record: person, backHref: `/people/edit/${person.id}`, redirectTo: `/people/${person.id}` });
    }
});

app.post("/people/delete/:id", (req, res) => {
    const person = findPerson(req, res);
    if (person) {
        handleDelete("people", req, res, { record: person, backHref: `/people/${person.id}`, redirectTo: "/people" });
    }
});

app.get("/people/:id", (req, res) => {
    const person = findPerson(req, res);
    if (!person) {
        return;
    }
    const assignments = projectPeople.filter(row => row.personId === person.id);
    const roles = [
        mentors.some(mentor => mentor.personId === person.id) ? "Mentor" : null,
        students.some(student => student.personId === person.id) ? "Student" : null
    ].filter(Boolean);
    sendDetailPage(res, {
        entityKey: "people",
        record: person,
        itemPath: "/people",
        listPath: "/people",
        extra: `<section class="panel">
            <h2>Projects</h2>
            <p>${roles.map(role => `<span class="tag">${role}</span>`).join(" ")}</p>
            ${assignments.length
        ? `<ul>${assignments.map(row => `<li><a href="/projects/${row.projectId}">${esc(displayOf("projects", row.projectId))}</a> <span class="muted">— ${esc(row.role)}, ${esc(row.status)}</span></li>`).join("")}</ul>`
        : `<p class="muted">Not assigned to any projects.</p>`}
        </section>`
    });
});


// ===== ERRORS (Issue #78) =====

// Development-only route that fails on purpose, to check the error log
if (!IS_PRODUCTION) {
    app.get("/dev/error", () => {
        throw new Error("Test error from /dev/error");
    });
}

// Anything no route answered
app.use((req, res) => {
    sendPage(res, "Not found", `<h1>Not found</h1><p>There's no page at ${esc(req.path)}.</p><p><a href="/">Back to the main board</a></p>`, 404);
});

// A route failed: write it to the error log, then show a friendly page
app.use((error, req, res, next) => {
    const statusCode = error.status || error.statusCode || 500;
    console.error(error);
    writeLog(ErrorLog, {
        action: "error",
        message: error.message || String(error),
        stack: error.stack,
        method: req.method,
        path: req.originalUrl,
        statusCode,
        actorPersonId: req.session?.personId ?? null
    });

    if (res.headersSent) {
        return next(error);
    }
    const message = statusCode < 500 ? error.message : "Something went wrong on our end. The error has been logged.";
    sendPage(res, "Something went wrong", `<h1>Something went wrong</h1><div class="errors">${esc(message)}</div><p><a href="/">Back to the main board</a></p>`, statusCode);
});


// Start listening
app.listen(PORT, () => {
    console.log(`App is listening on http://localhost:${PORT}`);
});
