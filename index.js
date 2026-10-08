const express = require("express");
const escapeHtml = require("ejs").escapeXML;

const path = require("path");
const projects = require("./data/projects");
const projectPeople = require("./data/projectPeople");

const skills = require("./data/skills.js");

const projectRouter = require("./routes/Projects.js")
const projectTypeRouter = require("./routes/ProjectTypes.js")
const projectStatusRouter = require("./routes/ProjectStatuses.js");

const documentRouter = require("./routes/Documents.js");

const studentsRouter = require("./routes/Students.js")

const requirementRouter = require("./routes/Requirements.js")

const channelRouter = require("./routes/CommunicationChannels.js")

const mainBoardStatusRouter = require("./routes/MainBoardStatuses.js")

const clientsRouter = require("./routes/clients.js");

// required data for threads
const threads = require("./data/threads");

const peopleRouter = require("./routes/People.js");

const statusRouter = require("./routes/Status.js");

const peopleProjectRouter = require("./routes/People-projects.js")

const messageRouter = require("./routes/messages.js");

const projectSkillsRouter = require("./routes/projectSkills.js");

const mentorRouter = require('./routes/Mentors.js')

const skillRouter = require("./routes/Skills.js")

const app = express();
app.set("view engine", "ejs");
const PORT = 3000;
const people = require("./data/people");

app.set("view engine", "ejs");

// use the public folder
app.use(express.static("public"));

const personSkills = require("./data/personSkills.js");


const channels = require("./data/channels");
// Turn a channel's IDs into a project and a list of members
function withDetails(channel) {
    return {
        ...channel,
        project: projects.find((p) => p.id === channel.projectId),
        members: channel.participantPersonIds.map((id) => people.find((p) => p.id === id)),
    };
}

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.set("view engine","ejs");
// TASK 12: TRACKIN PEOPLE (MENTORS/STUDENTS) ASSOCIATED WITH PROJECTS

// Allow body encoding for POST Requestsw
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.set("view engine", "ejs");



// Serve static files (css, js, images) from the public folder
app.use(express.static(path.join(__dirname, "public")));
// Render pages with EJS from the views folder
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs")

app.use(express.static('public'))

// This is a server-rendered app, so browsers can only send GET and POST.
// Every resource follows the same pattern:
//   GET  /thing/new         -> create form       POST /thing/new         -> save new
//   GET  /thing/edit/:id    -> edit form         POST /thing/edit/:id    -> save edit
//                                                POST /thing/delete/:id  -> delete (confirmed on the frontend)
// Static paths (new, edit, all) must be registered before /:id so they aren't shadowed.

// ===== PROJECT PEOPLE ASSOCIATIONS =====
app.get("/projects/people", (req, res) => {
    res.render("people-projects/index.ejs", {
        rows: projectPeople,
        people,
        projects
    });
});

app.post("/projects/people", (req, res) => {
    console.log("Attempted relationship creation");
    res.redirect("/projects/people/");
});

app.get("/projects/people/:relationshipid", (req, res) => {
    const rows = projectPeople.find((pp) => pp.id === Number(req.params.relationshipid));
    const person = people.find((ps) => ps.id === rows.personId);
    const project = projects.find((pr) => pr.id === rows.projectId);

    res.render("single-person-project/index.ejs", {
        rows,
        person,
        project
    });
});

app.get("/projects/people/:relationshipid/edit", (req, res) => {
    const row = projectPeople.find((pp) => pp.id === Number(req.params.relationshipid));

    res.render("edit-ppl-project/index.ejs", {
        row,
        people,
        projects
    });
});

app.post("/projects/people/:relationshipid", (req, res) => {
    console.log("Attempted edit for relationship", req.params.relationshipid, ":", req.body.role, "| Project", req.body.projectId, "| Person", req.body.personId);
    res.redirect("/projects/people/" + req.params.relationshipid);
});

app.post("/projects/people/:relationshipid/delete", (req, res) => {
    console.log("Attempted deletion for relationship", req.params.relationshipid);
    res.redirect("/projects/people/");
});

// ===== PROJECTS (Issue #1) =====
app.use("/projects/",projectRouter)
app.use("/documents", documentRouter);
app.use("/messages", messageRouter);

// ===== SKILLS (Issue #66) =====
app.use("/skills/", skillRouter)

// ===== STATUSES (Issue #2) =====

app.use("/", statusRouter);


// ===== MAIN BOARD STATUSES =====

// ===== MAIN BOARD STATUSES (Issue #23 pages, Issue #61 controller) =====
app.use(["/main-board/statuses", "/main-board-statuses"], mainBoardStatusRouter);


// ===== PROJECT STATUSES (Issue #3) =====
// Associates statuses with a specific project

// View all statuses used by a project
app.get("/projects/:projectid/statuses", (req, res) => {
    res.type("text/plain").send(`Show all statuses associated with project ${escapeHtml(req.params.projectid)}`);
});

// Form to add a status to a project
app.get("/projects/:projectid/statuses/new", (req, res) => {
    res.type("text/plain").send(`Show the form for adding a status to project ${escapeHtml(req.params.projectid)}`);
});

// Save a status added to a project
app.post("/projects/:projectid/statuses/new", (req, res) => {
    console.log(req.body);
    res.type("text/plain").send(`Saved a new status for project ${escapeHtml(req.params.projectid)}`);
});

// Form to update a project's status (e.g. its order in the workflow)
app.get("/projects/:projectid/statuses/edit/:id", (req, res) => {
    res.type("text/plain").send(`Show the form for editing status association ${escapeHtml(req.params.id)} on project ${escapeHtml(req.params.projectid)}`);
});

// Save the updated project status
app.post("/projects/:projectid/statuses/edit/:id", (req, res) => {
    console.log(req.body);
    res.type("text/plain").send(`Saved edits to status association ${escapeHtml(req.params.id)} on project ${escapeHtml(req.params.projectid)}`);
});

// Remove a status from a project
app.post("/projects/:projectid/statuses/delete/:id", (req, res) => {
    res.type("text/plain").send(`Removed status association ${escapeHtml(req.params.id)} from project ${escapeHtml(req.params.projectid)}`);
});

app.use("/project-status", projectStatusRouter);

// ===== PROJECT PEOPLE (Issue #12) =====
// Associates people (mentors and students) with a specific project
app.use("/projects/:projectid/people", peopleProjectRouter);


// ===== MENTORS (Issue #4) =====

app.use("/mentors",mentorRouter)

// ===== STUDENTS (Issue #5, pages for Issue #26) =====


app.use("/students/", studentsRouter);

// ===== COMMUNICATION CHANNELS (Issue #6) =====

app.use("/channels", channelRouter);


// ===== THREADS (Issue #7) =====

// create new thread
app.get("/threads/new", (req, res) => {
    res.render('partials/threads/new/new-thread-modal.ejs');
});

// post request for new thread 
// .redirect will send users back to a page following the post request
app.post("/threads/new", (req, res) => {
    console.log('New thread submitted:', req.body.threadName);
    res.redirect('/threads');
});

// see all threads
app.get("/threads", (req, res) => {
    const channelThreads = threads
        .filter((thread) => thread.channelId === 1)
        .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));

    res.render("partials/threads/all/all-thread-modal", { threads: channelThreads });
});


// edit a thread
app.get("/threads/edit/:id", (req, res) => {
    const thread = threads.find((t) => t.id === parseInt(req.params.id));
    res.render("partials/threads/edit/edit-thread-modal", { threadId: thread.id, threadName: thread.name });
});

app.post("/threads/edit/:id", (req, res) => {
    console.log(req.body);
    res.type("text/plain").send(`This route saves edits to thread ${escapeHtml(req.params.id)}`);
});

// post request for deleting a thrad
app.post("/threads/delete/:id", (req, res) => {
    console.log(`Thread ${req.params.id} deleted`);
    res.type("text/plain").send(`This route deletes thread ${escapeHtml(req.params.id)}`);
});

// see threads by id
app.get("/threads/:id", (req, res) => {
    const thread = threads.find((t) => t.id === parseInt(req.params.id));
    if (!thread) return res.status(404).send("Thread not found");
    res.render("partials/threads/show/show-threads-modal", { threadId: thread.id, threadName: thread.name });
});


// ===== MESSAGES (Issue #8) =====


// ===== REQUIREMENTS (Issue #9) =====
app.use("/requirements", requirementRouter);

// ===== PROJECT SKILLS (Issue #29 pages, Issue #67 controller) =====
app.use("/project-skills", projectSkillsRouter);

// ===== PROJECT SKILLS EJS RENDERED (Issue #29) =====



//---------------------------------TASK 28: The ASC needs pages to manage skills---------------------------------


skills.forEach((skill) => {
  console.log(skill.category, "-", skill.name);
});

// Grouped by category
const categories = [...new Set(skills.map((skill) => skill.category))];

categories.forEach((category) => {
  const inCategory = skills.filter((skill) => skill.category === category);
  console.log(category, inCategory.length + " skills");
});

// A single skill, for the page that shows one skill
//const skill = skills.find((s) => s.id === Number(req.params.id));





// ---------- CHANNELS ----------

// READ: view all (also holds the create modal)
app.get("/channels",(req,res)=>{
    res.render("channels/index.ejs", {
        channels: channels.map(withDetails),
        projects: projects,
    });
});

// CREATE: modal form submits here
app.post("/channels/add",(req,res)=>{
    console.log("Add channel:", req.body.name, "for project", req.body.projectId);
    res.redirect("/channels");
});

// UPDATE: edit page
app.get("/channels/:id/edit",(req,res)=>{
    const channel = channels.find((c) => c.id === Number(req.params.id));
    if (!channel) return res.status(404).send("Channel not found");
    res.render("channels/edit.ejs", { channel: channel, projects: projects });
});

// UPDATE: edit form submits here
app.post("/channels/:id/edit",(req,res)=>{
    console.log("Edit channel", req.params.id, "new name:", req.body.name);
    res.redirect(`/channels/${req.params.id}`);
});

// DELETE
app.post("/channels/:id/delete",(req,res)=>{
    console.log("Delete channel:", req.params.id);
    res.redirect("/channels");
});



// ===== PERSON SKILLS (Issue #13) =====

app.get("/person-skill/new", (req, res) => {
    res.send("Page to create new person-skill association");
});

app.post("/person-skill/new", (req, res) => {
    console.log(req.body);
    res.redirect("/person-skill/all");
});

app.get("/person-skill/all", (req, res) => {
    const rows = personSkills.map(row => {
        const person = people.find(p => p.id === row.personId);
        const skill = skills.find(s => s.id === row.skillId);
        const label = `${person.firstName} ${person.lastName} - ${skill.name}`;
        return `
            <tr>
                <td>${person.firstName} ${person.lastName}</td>
                <td>${skill.name}</td>
                <td>${row.proficiency}</td>
                <td>${row.yearsExperience}</td>
                <td>
                    <a href="/person-skill/edit/${row.id}">✏️</a>
                    <form action="/person-skill/delete/${row.id}" method="POST" style="display:inline;"
                          onsubmit="return confirm('Delete ${label}?')">
                        <button type="submit">🗑️</button>
                    </form>
                </td>
            </tr>`;
    }).join("");

    const personOptions = people.map(p => `<option value="${p.id}">${p.firstName} ${p.lastName}</option>`).join("");
    const skillOptions = skills.map(s => `<option value="${s.id}">${s.name}</option>`).join("");

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><title>Person Skills</title></head>
        <body>
            <h2>All Person Skills</h2>
            <button onclick="document.getElementById('addModal').showModal()">Add New</button>
            <table border="1" cellpadding="6">
                <tr><th>Person</th><th>Skill</th><th>Proficiency</th><th>Years</th><th></th></tr>
                ${rows}
            </table>

            <dialog id="addModal">
                <form action="/person-skill/new" method="POST">
                    <h3>Add Person Skill</h3>
                    <label>Person <select name="personId" required>${personOptions}</select></label><br><br>
                    <label>Skill <select name="skillId" required>${skillOptions}</select></label><br><br>
                    <button type="submit">Save</button>
                    <button type="button" onclick="document.getElementById('addModal').close()">Cancel</button>
                </form>
            </dialog>
        </body>
        </html>
    `);
});

app.get("/person-skill/edit/:id", (req, res) => {
    const row = personSkills.find(r => r.id === Number(req.params.id));
    if (!row) return res.status(404).send("Not found");

    const person = people.find(p => p.id === row.personId);
    const skill = skills.find(s => s.id === row.skillId);

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><title>Edit Person Skill</title></head>
        <body>
            <h2>Edit: ${person.firstName} ${person.lastName} - ${skill.name}</h2>
            <form action="/person-skill/edit/${row.id}" method="POST">
                <input type="text" name="proficiency" value="${row.proficiency}" required>
                <input type="number" name="yearsExperience" value="${row.yearsExperience}" required>
                <input type="submit" value="Update">
            </form>
            <a href="/person-skill/all">Cancel</a>
        </body>
        </html>
    `);
});

app.post("/person-skill/edit/:id", (req, res) => {
    console.log(req.body);
    res.redirect("/person-skill/all");
});

app.post("/person-skill/delete/:id", (req, res) => {
    console.log(`Deleting person-skill association with id ${req.params.id}`);
    res.redirect(`/person-skill/all`);
});

app.get("/person-skill/:id", (req, res) => {
    res.type("text/plain").send(`Page to view person-skill association with id ${escapeHtml(req.params.id)}`);
});


// ===== PROJECT TYPES (Issue #14) =====

app.use("/project-types",projectTypeRouter)

// ===== CLIENTS (Issue #16) =====
app.use("/clients", clientsRouter);

// ===== PEOPLE (Issue #18) =====
app.use("/people", peopleRouter);

// Start listening
app.listen(PORT, () => {
    console.log(`App is listening on http://localhost:${PORT}`);
});
