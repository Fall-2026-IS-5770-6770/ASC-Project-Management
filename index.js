const express = require("express");

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

const app = express();
const PORT = process.env.PORT || 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({ extended: true }));

// Express 5 leaves req.body undefined when a request has no body
app.use((req, res, next) => {
    req.body = req.body || {};
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
    body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: var(--bg); color: var(--text); }
    header { background: var(--accent); color: #fff; padding: .6rem 1rem; display: flex; flex-wrap: wrap; gap: .3rem 1rem; align-items: center; }
    header a { color: #fff; text-decoration: none; opacity: .9; }
    header a:hover { opacity: 1; text-decoration: underline; }
    header .brand { font-weight: 700; opacity: 1; margin-right: .5rem; }
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
    .errors { background: #fef3f2; border: 1px solid #fecdca; color: var(--danger); padding: .75rem 1rem; border-radius: 6px; }
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
    </header>
    <main>${body}</main>
</body>
</html>`);
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

const ENTITIES = {
    projects: {
        label: "project",
        plural: "projects",
        store: projects,
        display: project => project.name,
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
        afterCreate: project => {
            if (isInProgress(project.mainBoardStatusId)) {
                initializeWorkspace(project);
            }
        },
        afterUpdate: (project, before) => {
            if (project.mainBoardStatusId !== before.mainBoardStatusId && isInProgress(project.mainBoardStatusId)) {
                initializeWorkspace(project);
            }
        }
    },
    statuses: {
        label: "status",
        plural: "statuses",
        store: statuses,
        display: status => status.name,
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
        fields: []
    },
    people: {
        label: "person",
        plural: "people",
        store: people,
        display: person => `${person.firstName} ${person.lastName}`,
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
        fields: []
    },
    projectTypes: {
        label: "project type",
        plural: "project types",
        store: projectTypes,
        display: type => type.name,
        fields: []
    },
    projectPeople: {
        label: "project assignment",
        plural: "project assignments",
        store: projectPeople,
        display: row => `${displayOf("people", row.personId)} (${row.role}) on ${displayOf("projects", row.projectId)}`,
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

function createRecord(entityKey, data) {
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
    entity.store.push(record);
    if (entity.afterCreate) {
        entity.afterCreate(record);
    }
    return { record };
}

function updateRecord(entityKey, record, data) {
    const entity = ENTITIES[entityKey];
    const errors = entity.validate ? entity.validate({ ...record, ...data }, record) : [];
    if (errors.length) {
        return { errors };
    }

    const before = { ...record };
    Object.assign(record, data);
    if (entity.afterUpdate) {
        entity.afterUpdate(record, before);
    }
    return { record, before };
}

// Records that belong to this one (cascade) are deleted with it, ids in
// multi-selects are pulled out, and anything else pointing at it blocks the delete.
function deleteRecord(entityKey, record) {
    const entity = ENTITIES[entityKey];
    const blockers = [];
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
            }
        }
    }

    if (blockers.length) {
        return { errors: [`Can't delete ${entity.display(record)}: ${blockers.join(", ")} still refer to this ${entity.label}.`] };
    }

    const index = entity.store.indexOf(record);
    if (index === -1) {
        return {};
    }
    entity.store.splice(index, 1);

    for (const [otherKey, dependent] of dependents) {
        deleteRecord(otherKey, dependent);
    }
    for (const other of Object.values(ENTITIES)) {
        for (const field of other.fields.filter(f => f.ref === entityKey && f.type === "multiselect")) {
            other.store.forEach(row => {
                row[field.name] = (row[field.name] || []).filter(id => id !== record.id);
            });
        }
    }

    if (entity.afterDelete) {
        entity.afterDelete(record);
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

function initializeWorkspace(project) {
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
    const rows = entity.fields
        .map(field => `<dt>${esc(field.label)}</dt><dd>${esc(fieldText(field, record[field.name]))}</dd>`)
        .join("");
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
    const result = errors.length ? { errors } : createRecord(entityKey, data);
    if (result.errors) {
        return sendErrors(res, result.errors, backHref);
    }
    res.redirect(typeof redirectTo === "function" ? redirectTo(result.record) : redirectTo);
}

function handleUpdate(entityKey, req, res, { record, backHref, redirectTo, input = req.body, omit = [] }) {
    const { data, errors } = parseRecord(entityKey, input, { omit });
    const result = errors.length ? { errors } : updateRecord(entityKey, record, data);
    if (result.errors) {
        return sendErrors(res, result.errors, backHref);
    }
    console.log(`Updated ${ENTITIES[entityKey].label} ${record.id}: ${ENTITIES[entityKey].display(record)}`);
    res.redirect(typeof redirectTo === "function" ? redirectTo(record) : redirectTo);
}

function handleDelete(entityKey, req, res, { record, backHref, redirectTo }) {
    const result = deleteRecord(entityKey, record);
    if (result.errors) {
        return sendErrors(res, result.errors, backHref);
    }
    res.redirect(redirectTo);
}


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
    const result = errors.length ? { errors } : createRecord("projects", data);
    if (result.errors) {
        return sendErrors(res, result.errors, "/projects");
    }
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
    const result = errors.length ? { errors } : updateRecord("projects", project, data);
    if (result.errors) {
        return sendErrors(res, result.errors, `/projects/edit/${project.id}`);
    }
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
    const result = errors.length ? { errors } : updateRecord("projects", project, data);
    if (result.errors) {
        return sendErrors(res, result.errors, `/projects/edit/${project.id}`);
    }
    res.redirect(`/projects/edit/${project.id}`);
});

// Delete one project by id, along with everything that belongs to it
app.post("/projects/delete/:id", (req, res) => {
    const project = findById("projects", req.params.id);
    if (!project) {
        return sendNotFound(res, "project", req.params.id);
    }
    const result = deleteRecord("projects", project);
    if (result.errors) {
        return sendErrors(res, result.errors, "/projects");
    }
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
    const columns = projectStatuses.filter(row => row.projectId === project.id).sort(byOrder);
    const hasWorkspace = Boolean(project.workspaceInitializedAt) || projectChannels.length > 0 || columns.length > 0;
    const money = value => (value == null ? "—" : `$${Number(value).toLocaleString("en-US")}`);

    const workspace = hasWorkspace
        ? `<p><strong>Board columns:</strong> ${columns.map(row => `<span class="tag">${esc(displayOf("statuses", row.statusId))}</span>`).join(" ") || "—"}</p>
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
    const result = errors.length ? { errors } : createRecord("projectPeople", data);
    if (result.errors) {
        return sendErrors(res, result.errors, `/projects/edit/${project.id}`);
    }
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
        deleteRecord("projectPeople", row);
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


// ===== COMMUNICATION CHANNELS (Issue #6) =====

// View all communication channels
app.get("/channels/all", (req, res) => {
    res.send("Viewing all channels");
});

// Create a new communication channel
app.get("/channels/new", (req, res) => {
    res.send("Send the create channel page");
});

// Save a new communication channel
app.post("/channels/new", (req, res) => {
    console.log(req.body);
    res.send("Saving a new channel");
});

// Edit a specific communication channel
app.get("/channels/edit/:id", (req, res) => {
    res.send(`Edit specific channel with ID: ${req.params.id}`);
});

// Save the edited communication channel
app.post("/channels/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Saving the edited channel ${req.params.id}`);
});

// Delete a specific communication channel
app.post("/channels/delete/:id", (req, res) => {
    res.send(`Deleting channel ${req.params.id}`);
});

// View a specific communication channel
app.get("/channels/:id", (req, res) => {
    res.send(`Viewing channel with ID: ${req.params.id}`);
});


// ===== THREADS (Issue #7) =====

app.get("/threads/new", (req, res) => {
    res.send("This route sends the create thread page");
});

app.post("/threads/new", (req, res) => {
    console.log(req.body);
    res.send("This route saves a new thread");
});

app.get("/threads", (req, res) => {
    res.send("This route sends all threads");
});

app.get("/threads/edit/:id", (req, res) => {
    res.send(`This route sends the edit page for thread ${req.params.id}`);
});

app.post("/threads/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`This route saves edits to thread ${req.params.id}`);
});

app.post("/threads/delete/:id", (req, res) => {
    res.send(`This route deletes thread ${req.params.id}`);
});

app.get("/threads/:id", (req, res) => {
    res.send(`This route returns thread ${req.params.id}`);
});


// ===== MESSAGES (Issue #8) =====

app.get("/messages/new", (req, res) => {
    res.send("Send the create message page");
});

app.post("/messages/new", (req, res) => {
    console.log(req.body);
    res.send("Saving a new message");
});

app.get("/messages", (req, res) => {
    res.send("View all messages");
});

app.get("/messages/edit/:id", (req, res) => {
    res.send(`Edit message page for message ${req.params.id}`);
});

app.post("/messages/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Saving edits to message ${req.params.id}`);
});

app.post("/messages/delete/:id", (req, res) => {
    res.send(`Deleting message ${req.params.id}`);
});

app.get("/messages/:id", (req, res) => {
    res.send(`View message ${req.params.id}`);
});


// ===== REQUIREMENTS (Issue #9) =====

// Users should be able to create requirements
app.get("/requirements/new", (req, res) => {
    res.send("Create requirements page");
});

// Save the new requirement
app.post("/requirements/new", (req, res) => {
    console.log(req.body);
    res.send("Saving a new requirement");
});

// View all requirements
app.get("/requirements", (req, res) => {
    res.send("View all requirements");
});

// Users should be able to edit existing requirements
app.get("/requirements/edit/:id", (req, res) => {
    res.send(`Edit requirement page for ID: ${req.params.id}`);
});

// Save the edit form
app.post("/requirements/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Save edited requirement with ID: ${req.params.id}`);
});

// Delete requirements that are no longer needed or were created accidentally
app.post("/requirements/delete/:id", (req, res) => {
    res.send(`Delete requirement with ID: ${req.params.id}`);
});

// View a specific requirement
app.get("/requirements/:id", (req, res) => {
    res.send(`View requirement page for ID: ${req.params.id}`);
});


// ===== SKILLS (Issue #10) =====

app.get("/skills/new", (req, res) => {
    res.send("Send the create skill page");
});

app.post("/skills/new", (req, res) => {
    console.log(req.body);
    res.send("Save the new skill");
});

app.get("/skills", (req, res) => {
    res.send("Send all of the skills");
});

app.get("/skills/edit/:id", (req, res) => {
    res.send(`Send the edit page for skill ${req.params.id}`);
});

app.post("/skills/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Save the edits to skill ${req.params.id}`);
});

app.post("/skills/delete/:id", (req, res) => {
    res.send(`Delete skill ${req.params.id}`);
});

app.get("/skills/:id", (req, res) => {
    res.send(`Send skill ${req.params.id}`);
});


// ===== PROJECT SKILLS (Issue #11) =====

app.get("/project-skills/new", (req, res) => {
    res.send("Create project skill association page");
});

app.post("/project-skills/new", (req, res) => {
    console.log(req.body);
    res.send("New project skill association saved");
});

app.get("/project-skills", (req, res) => {
    res.send("View all project skill associations");
});

app.get("/project-skills/edit/:id", (req, res) => {
    res.send(`Edit project skill association with id: ${req.params.id}`);
});

app.post("/project-skills/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Project skill association with id: ${req.params.id} updated`);
});

app.post("/project-skills/delete/:id", (req, res) => {
    res.send(`Project skill association with id: ${req.params.id} deleted`);
});

app.get("/project-skills/:id", (req, res) => {
    res.send(`View project skill association with id: ${req.params.id}`);
});


// ===== PERSON SKILLS (Issue #13) =====

app.get("/person-skill/new", (req, res) => {
    res.send("Page to create new person-skill association");
});

app.post("/person-skill/new", (req, res) => {
    console.log(req.body);
    res.send("Save new person-skill association");
});

app.get("/person-skill/all", (req, res) => {
    res.send("Page to view all person-skill associations");
});

app.get("/person-skill/edit/:id", (req, res) => {
    res.send(`Page to edit person-skill association with id ${req.params.id}`);
});

app.post("/person-skill/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Save edit to person-skill association with id ${req.params.id}`);
});

app.post("/person-skill/delete/:id", (req, res) => {
    res.send(`Delete person-skill association with id ${req.params.id}`);
});

app.get("/person-skill/:id", (req, res) => {
    res.send(`Page to view person-skill association with id ${req.params.id}`);
});


// ===== PROJECT TYPES (Issue #14) =====

app.get("/project-types/new", (req, res) => {
    res.send("Create project type page");
});

app.post("/project-types/new", (req, res) => {
    console.log(req.body);
    res.send("Project type created");
});

app.get("/project-types", (req, res) => {
    res.send("List of the available types of projects");
});

app.get("/project-types/edit/:id", (req, res) => {
    res.send(`Edit page for project type ${req.params.id}`);
});

app.post("/project-types/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Project type ${req.params.id} updated`);
});

app.post("/project-types/delete/:id", (req, res) => {
    res.send(`Project type ${req.params.id} deleted`);
});

app.get("/project-types/:id", (req, res) => {
    res.send(`Project type ${req.params.id} details`);
});


// ===== PROJECT TYPE ASSOCIATIONS (Issue #15) =====
// Associates project types with a specific project (many-to-many)

app.get("/project-project-types/new", (req, res) => {
    res.send("Send the page for associating a project type with a project");
});

app.post("/project-project-types/new", (req, res) => {
    console.log(req.body);
    res.send("Save the new project-project type association");
});

app.get("/project-project-types", (req, res) => {
    res.send("Send all of the project-project type associations");
});

app.get("/project-project-types/edit/:id", (req, res) => {
    res.send(`Send the edit page for project-project type association ${req.params.id}`);
});

app.post("/project-project-types/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Save the edits to project-project type association ${req.params.id}`);
});

app.post("/project-project-types/delete/:id", (req, res) => {
    res.send(`Delete project-project type association ${req.params.id}`);
});

app.get("/project-project-types/:id", (req, res) => {
    res.send(`Send project-project type association ${req.params.id}`);
});


// ===== CLIENTS (Issue #16) =====

// View all clients
app.get("/clients/all", (req, res) => {
    res.send("Viewing all clients");
});

// New client page
app.get("/clients/new", (req, res) => {
    res.send("Send the new client page");
});

// Form submission for creating a new client
app.post("/clients/new", (req, res) => {
    console.log(req.body);
    res.send("Saving a new client");
});

// Edit client page by id
app.get("/clients/edit/:id", (req, res) => {
    res.send(`Edit specific client ${req.params.id}`);
});

// Save edited client
app.post("/clients/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Saving edits to client ${req.params.id}`);
});

// Delete client
app.post("/clients/delete/:id", (req, res) => {
    res.send(`Deleting client ${req.params.id}`);
});

// View a specific client
app.get("/clients/:id", (req, res) => {
    res.send(`Viewing a specific client ${req.params.id}`);
});


// ===== DOCUMENTS (Issue #17) =====
// Documents always belong to a project

app.get("/documents/new", (req, res) => {
    res.send("Send the create document page");
});

app.post("/documents/new", (req, res) => {
    console.log(req.body);
    res.send("Save the new document");
});

app.get("/documents", (req, res) => {
    res.send("Send all of the documents");
});

app.get("/documents/edit/:id", (req, res) => {
    res.send(`Send the edit page for document ${req.params.id}`);
});

app.post("/documents/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Save the edits to document ${req.params.id}`);
});

app.post("/documents/delete/:id", (req, res) => {
    res.send(`Delete document ${req.params.id}`);
});

app.get("/documents/:id", (req, res) => {
    res.send(`Send document ${req.params.id}`);
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


// Start listening
app.listen(PORT, () => {
    console.log(`App is listening on http://localhost:${PORT}`);
});
