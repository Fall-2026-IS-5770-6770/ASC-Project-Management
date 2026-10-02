const express = require("express");

const statuses = require("./data/statuses.js");
const documents = require("./data/documents.js");

const path = require("path");
const projectSkills = require("./data/projectSkills");
const projects = require("./data/projects");

const mainBoardStatuses = require("./data/mainBoardStatuses.js");

const students = require("./data/students.js");
const projectTypes = require("./data/projectTypes.js");
const skills = require("./data/skills.js");

const projectRouter = require("./routes/Projects.js")

// required data for threads
const threads = require("./data/threads");


const app = express();
app.set("view engine", "ejs");
const PORT = 3000;
const people = require("./data/people");

app.set("view engine", "ejs");

// use the public folder
app.use(express.static("public"));

const personSkills = require("./data/personSkills.js");


// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine', 'ejs')

// TASK 12: TRACKIN PEOPLE (MENTORS/STUDENTS) ASSOCIATED WITH PROJECTS

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

// ===== PROJECTS (Issue #1) =====
app.use("/projects/",projectRouter)

// ===== STATUSES (Issue #2) =====

app.get("/statuses", (req, resp) => {
    const statusMessagePrefix = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>All Statuses</title>
        </head>
        <body>
            <h2>All existing project statuses are:</h2>
            <a href="/status/new"><button>Add New</button></a>
            <hr />
    `;

    const statusMessageSuffix = statuses
        .map(status => {
            return `
                <div style="margin-bottom: 10px;">
                    <strong>${status.id}:</strong> <a href="/status/${status.id}">${status.name}</a>
                    <a href="/status/edit/${status.id}"><button>Edit</button></a>
                    <form action="/status/delete/${status.id}" method="POST" style="display: inline;" onsubmit="return confirm('Delete status ${status.name}?')">
                        <button type="submit">Delete</button>
                    </form>
                </div>
            `;
        })
        .join("");

    const statusMessage = statusMessagePrefix + statusMessageSuffix + "</body></html>";

    resp.send(statusMessage);
});

app.get("/status/new", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Create Status</title>
        </head>
        <body>
            <h2>Create a New Status</h2>
            <form action="/status/new" method="POST">
                <input type="text" placeholder="Status Name" name="status_name" required>
                <input type="text" placeholder="Status Description" name="status_description" required>
                <input type="number" placeholder="Status Order" name="status_order">
                <input type="submit" value="Save">
            </form>
            <a href="/statuses">Back to all statuses</a>
        </body>
        </html>
    `);
});

app.post("/status/new", (req, resp) => {
    const statusName = req.body.status_name;
    const statusDescription = req.body.status_description;

    if (!statusName || !statusDescription) {
        return resp.status(400).send("Missing required fields: status_name or status_description");
    }

    // Use the highest existing id so ids stay unique after deletes
    const newStatusId = statuses.reduce((max, status) => Math.max(max, status.id), 0) + 1;
    const statusOrder = req.body.status_order ? Number(req.body.status_order) : newStatusId;

    statuses.push({
        id: newStatusId,
        name: statusName,
        description: statusDescription,
        order: statusOrder
    });

    resp.redirect("/statuses");
});

app.get("/status/edit/:id", (req, resp) => {
    const statusId = Number(req.params.id);
    const selectedStatus = statuses.find(status => status.id === statusId);

    if (!selectedStatus) {
        return resp.status(404).send(`Status with id ${statusId} not found`);
    }

    resp.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Edit Status</title>
        </head>
        <body>
            <h2>Edit Status: ${selectedStatus.name}</h2>
            <form action="/status/edit/${selectedStatus.id}" method="POST">
                <input type="text" value="${selectedStatus.name}" name="status_name" required>
                <input type="text" value="${selectedStatus.description}" name="status_description" required>
                <input type="number" value="${selectedStatus.order}" name="status_order" required>
                <input type="submit" value="Update">
            </form>
            <a href="/statuses">Cancel</a>
        </body>
        </html>
    `);
});

app.post("/status/edit/:id", (req, resp) => {
    const statusId = Number(req.params.id);
    const selectedStatus = statuses.find(status => status.id === statusId);

    if (!selectedStatus) {
        return resp.status(404).send(`Status with id ${statusId} not found`);
    }

    const { status_name, status_description, status_order } = req.body;

    if (!status_name || !status_description) {
        return resp.status(400).send("Missing required fields: status_name or status_description");
    }

    selectedStatus.name = status_name;
    selectedStatus.description = status_description;
    selectedStatus.order = status_order ? Number(status_order) : selectedStatus.order;

    resp.redirect("/statuses");
});

app.post("/status/delete/:id", (req, resp) => {
    const statusId = Number(req.params.id);
    const statusIndex = statuses.findIndex(status => status.id === statusId);

    if (statusIndex === -1) {
        return resp.status(404).send(`Status with id ${statusId} not found`);
    }

    statuses.splice(statusIndex, 1);

    resp.redirect("/statuses");
});

// View a specific status
app.get("/status/:id", (req, resp) => {
    const statusId = Number(req.params.id);
    const selectedStatus = statuses.find(status => status.id === statusId);

    if (!selectedStatus) {
        return resp.status(404).send(`Status with id ${statusId} not found`);
    }

    resp.send(`
        <h2>${selectedStatus.name}</h2>
        <p>${selectedStatus.description}</p>
        <p>Order: ${selectedStatus.order}</p>
        <a href="/statuses">Back to all statuses</a>
    `);
});


// ===== MAIN BOARD STATUSES =====

const mainBoardStatusRoutes = ["/main-board/statuses", "/main-board-statuses"];

app.get(mainBoardStatusRoutes, (req, res) => {
    const orderedStatuses = [...mainBoardStatuses].sort((firstStatus, secondStatus) => firstStatus.order - secondStatus.order);
    res.render("main-board-statuses/index", { statuses: orderedStatuses });
});

app.get(["/main-board/statuses/new", "/main-board-statuses/new"], (req, res) => {
    res.redirect("/main-board/statuses");
});

app.post(["/main-board/statuses/new", "/main-board-statuses/new"], (req, res) => {
    console.log("Main board status create request:", req.body);
    res.redirect("/main-board/statuses");
});

app.get(["/main-board/statuses/edit/:id", "/main-board-statuses/edit/:id"], (req, res) => {
    const statusId = Number(req.params.id);
    const status = mainBoardStatuses.find(mainBoardStatus => mainBoardStatus.id === statusId);

    if (!status) {
        return res.status(404).send(`Main board status with id ${statusId} not found`);
    }

    res.render("main-board-statuses/edit", { status });
});

app.post(["/main-board/statuses/edit/:id", "/main-board-statuses/edit/:id"], (req, res) => {
    console.log(`Main board status edit request for ${req.params.id}:`, req.body);
    res.redirect("/main-board/statuses");
});

app.post(["/main-board/statuses/delete/:id", "/main-board-statuses/delete/:id"], (req, res) => {
    console.log(`Main board status delete request for ${req.params.id}`);
    res.redirect("/main-board/statuses");
});


// ===== PROJECT STATUSES (Issue #3) =====
// Associates statuses with a specific project

// View all statuses used by a project
app.get("/projects/:projectid/statuses", (req, res) => {
    res.send(`Show all statuses associated with project ${req.params.projectid}`);
});

// Form to add a status to a project
app.get("/projects/:projectid/statuses/new", (req, res) => {
    res.send(`Show the form for adding a status to project ${req.params.projectid}`);
});

// Save a status added to a project
app.post("/projects/:projectid/statuses/new", (req, res) => {
    console.log(req.body);
    res.send(`Saved a new status for project ${req.params.projectid}`);
});

// Form to update a project's status (e.g. its order in the workflow)
app.get("/projects/:projectid/statuses/edit/:id", (req, res) => {
    res.send(`Show the form for editing status association ${req.params.id} on project ${req.params.projectid}`);
});

// Save the updated project status
app.post("/projects/:projectid/statuses/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Saved edits to status association ${req.params.id} on project ${req.params.projectid}`);
});

// Remove a status from a project
app.post("/projects/:projectid/statuses/delete/:id", (req, res) => {
    res.send(`Removed status association ${req.params.id} from project ${req.params.projectid}`);
});


// ===== PROJECT PEOPLE (Issue #12) =====
// Associates people (mentors and students) with a specific project

// View all people associated with a project
app.get("/projects/:projectid/people", (req, res) => {
    res.send(`Show all people associated with project ${req.params.projectid}`);
});

// Form to create a relationship
app.get("/projects/:projectid/people/new", (req, res) => {
    res.send(`Show the form for adding a person to project ${req.params.projectid}`);
});

// Save new relationship
app.post("/projects/:projectid/people/new", (req, res) => {
    console.log(req.body);
    res.send(`Saved a new relationship between a person and project ${req.params.projectid}`);
});

// Form to edit a relationship
app.get("/projects/:projectid/people/edit/:id", (req, res) => {
    res.send(`Show the form for editing relationship ${req.params.id} on project ${req.params.projectid}`);
});

// Save edited relationship
app.post("/projects/:projectid/people/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Saved edits to relationship ${req.params.id} on project ${req.params.projectid}`);
});

// Delete a relationship
app.post("/projects/:projectid/people/delete/:id", (req, res) => {
    res.send(`Deleted relationship ${req.params.id} from project ${req.params.projectid}`);
});

// View a specific relationship
app.get("/projects/:projectid/people/:id", (req, res) => {
    res.send(`Show relationship ${req.params.id} between a person and project ${req.params.projectid}`);
});


// ===== MENTORS (Issue #4) =====

app.get("/mentors/new", (req, res) => {
    const people = require("./data/people");
    const projectTypes = require("./data/projectTypes")

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mentors</title>
        </head>

        <body>

            <h1>Mentors</h1>

            <h2>Create a New Mentor</h2>

            <form action="/mentors/new" method="POST">

                <label for="personId">Person:</label>

                <select name="personId" id="personId" required>

                    <option value="">Select a person</option>

                    ${people.map(person => `
                        <option value="${person.id}">
                            ${person.firstName} ${person.lastName}
                        </option>
                    `).join("")}

                </select>

                <br><br>

                <label for="department">Department:</label>
                <input
                    type="text"
                    name="department"
                    placeholder="Mentor Department"
                >

                <br><br>

                <label for="availability">Availability:</label>
                <input
                    type="text"
                    name="availability"
                    placeholder="Days and Times available"
                >

                <br><br>

                <label for="maxProjectLoad">Max Project Load:</label>
                <input
                    type="number" 
                    name="maxProjectLoad"
                >

                <br><br>

                <label for="preferredProjectTypeId">Preferred Project Type:</label>

                <select name="preferredProjectTypeId" id="preferredProjectTypeId" required>

                    <option value="">Preferred Project Type</option>

                    ${projectTypes.map(project => `
                        <option value="${project.id}">
                            ${project.name}
                        </option>
                    `)}

                </select>

                <input type="submit" value="Create Mentor">

            </form>

            <hr>

        </body>
        </html>
    `);
});

app.post("/mentors/new", (req, res) => {
    //console.log(req.body);
    //res.send("Saving a new mentor");
    const mentors = require("../data/mentors");

    const newMentor = {
        id: mentors.length + 1,
        personId: Number(req.body.personId),
        department: req.body.department,
        availability: req.body.availability,
        maxProjectLoad: Number(req.body.maxProjectLoad),
        preferredProjectTypeId: req.body.preferredProjectTypeId,
        skillIds: []
    };

    mentors.push(newMentor);

    res.redirect("/mentors");
});

app.get("/mentors", (req, res) => {

    const mentors = require("./data/mentors");
    const people = require("./data/people");
    const skills = require("./data/skills");

    const mentorData = mentors.map((mentor) => {
        const person = people.find((p) => p.id === mentor.personId);

        const mentorSkills = mentor.skillIds.map((id) =>
            skills.find((s) => s.id === id)
        );

        return {
            mentor,
            person,
            skills: mentorSkills
        };
    });
    res.render("mentors/index.ejs", { mentorData });

});

app.get("/mentors/edit/:id", (req, res) => {
    const mentors = require("./data/mentors");
    //res.send(`Edit mentor page for mentor ${req.params.id}`);
    const mentorId = Number(req.params.id);
    const selectedMentor = mentors.find(status => status.id === mentorId);

    if (!selectedMentor) {
        return res.status(404).send(`Status with id ${mentorId} not found`);
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Edit Status</title>
        </head>
        <body>
            <h2>Edit Mentor: ${selectedMentor.id}</h2>
            <form action="/mentors/edit/${selectedMentor.id}" method="POST">
                <input type="text" value="${selectedMentor.department}" name="mentor_deparment" required>
                <input type="text" value="${selectedMentor.availability}" name="mentor_availability" required>
                <input type="number" value="${selectedMentor.maxProjectLoad}" name="mentor_project_load" required>
                <input type="submit" value="Update">
            </form>
            <a href="/mentors">Cancel</a>
        </body>
        </html>
    `);
});

app.post("/mentors/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Saving an edit on mentor ${req.params.id}`);
});

app.post("/mentors/delete/:id", (req, res) => {
    //res.send(`Deleting mentor ${req.params.id}`);
    const mentors = require("./data/mentors");

    const mentorId = Number(req.params.id);

    const index = mentors.findIndex(
        (mentor) => mentor.id === mentorId
    );

    if (index !== -1) {
        mentors.splice(index, 1);
    }

    res.redirect("/mentors");
});

app.get("/mentors/:id", (req, res) => {
    res.send(`Getting mentor ${req.params.id}`);
});


// ===== STUDENTS (Issue #5, pages for Issue #26) =====
// A student row has no name on it; it points at a person by personId.

const studentApprovalStatuses = ["Approved", "Pending", "Not Approved"];

// Attach the matching person so views can show the student's name and contact info
const withPerson = (student) => ({
    ...student,
    person: people.find((p) => p.id === student.personId)
});

// Data every page with the student form needs (create modal and edit page)
const studentFormOptions = () => ({
    projectTypes,
    skills,
    approvalStatuses: studentApprovalStatuses,
    // Only people who are not already students can be made into one
    availablePeople: people.filter((person) => !students.some((s) => s.personId === person.id))
});

const renderStudentList = (res, openCreateModal) => {
    res.render("students/index", {
        title: "Students",
        activePage: "Students",
        students: students.map(withPerson),
        openCreateModal,
        ...studentFormOptions()
    });
};

// Create is a modal on the list page, so /students/new opens the list with the modal showing
app.get("/students/new", (req, res) => {
    renderStudentList(res, true);
});

app.post("/students/new", (req, res) => {
    const personId = Number(req.body.personId);

    if (!people.some((p) => p.id === personId)) {
        return res.status(400).send(`Person with id ${personId} not found`);
    }
    if (students.some((s) => s.personId === personId)) {
        return res.status(400).send(`Person with id ${personId} is already a student`);
    }

    // Use the highest existing id so ids stay unique after deletes
    const newStudentId = students.reduce((max, s) => Math.max(max, s.id), 0) + 1;

    students.push({
        id: newStudentId,
        personId,
        major: req.body.major,
        graduationDate: req.body.graduationDate,
        resumeUrl: req.body.resumeUrl,
        minHoursPerWeek: Number(req.body.minHoursPerWeek),
        maxHoursPerWeek: Number(req.body.maxHoursPerWeek),
        workApprovalStatus: req.body.workApprovalStatus,
        availability: req.body.availability,
        preferredProjectTypeId: req.body.preferredProjectTypeId ? Number(req.body.preferredProjectTypeId) : null,
        // One checked box comes through as a string, several as an array
        skillIds: [].concat(req.body.skillIds ?? []).map(Number)
    });

    res.redirect("/students");
});

app.get("/students", (req, res) => {
    renderStudentList(res, false);
});

app.get("/students/edit/:id", (req, res) => {
    const student = students.find((s) => s.id === Number(req.params.id));

    if (!student) {
        return res.status(404).send(`Student with id ${req.params.id} not found`);
    }

    res.render("students/edit", {
        title: "Edit Student",
        activePage: "Students",
        student: withPerson(student),
        ...studentFormOptions()
    });
});

// The data file is not updated yet; logging proves the edit form reached this route
app.post("/students/edit/:id", (req, res) => {
    console.log(`Edit submitted for student ${req.params.id}: major = ${req.body.major}`);
    res.redirect(`/students/${req.params.id}`);
});

// Removes only the student record; the underlying person is kept
app.post("/students/delete/:id", (req, res) => {
    const studentIndex = students.findIndex((s) => s.id === Number(req.params.id));

    if (studentIndex === -1) {
        return res.status(404).send(`Student with id ${req.params.id} not found`);
    }

    students.splice(studentIndex, 1);
    res.redirect("/students");
});

app.get("/students/:id", (req, res) => {
    const student = students.find((s) => s.id === Number(req.params.id));

    if (!student) {
        return res.status(404).send(`Student with id ${req.params.id} not found`);
    }

    res.render("students/show", {
        title: "Student",
        activePage: "Students",
        student: withPerson(student),
        preferredProjectType: projectTypes.find((type) => type.id === student.preferredProjectTypeId),
        studentSkills: skills.filter((skill) => student.skillIds.includes(skill.id))
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
    res.send(`This route saves edits to thread ${req.params.id}`);
});

// post request for deleting a thrad
app.post("/threads/delete/:id", (req, res) => {
    console.log(`Thread ${req.params.id} deleted`);
    res.send(`This route deletes thread ${req.params.id}`);
});

// see threads by id
app.get("/threads/:id", (req, res) => {
    const thread = threads.find((t) => t.id === parseInt(req.params.id));
    if (!thread) return res.status(404).send("Thread not found");
    res.render("partials/threads/show/show-threads-modal", { threadId: thread.id, threadName: thread.name });
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

// ===== PROJECT SKILLS EJS RENDERED (Issue #29) =====

app.get("/project-skills", (req, res) => {
    const enrichedProjectSkills = projectSkills.map(ps => {
        const project = projects.find(p => p.id === Number(ps.projectId));
        const skill = skills.find(s => s.id === Number(ps.skillId));
        return {
            ...ps,
            projectName: project ? project.name : "Unknown Project",
            skillName: skill ? skill.name : "Unknown Skill"
        };
    })
    .sort((a, b) => {
        // Primary sort: Compare Project IDs (Least to Greatest)
        if (a.projectId !== b.projectId) {
            return a.projectId - b.projectId;
        }
        // Secondary sort: If Project IDs are the same, compare Skill IDs (Least to Greatest)
        return a.skillId - b.skillId;
    });
    
    res.render("project-skills/index.ejs", { projectSkills: enrichedProjectSkills });
});


app.get("/project-skills/new", (req, res) => {
    res.render("project-skills/create.ejs", { projects, skills })
})

app.get("/project-skills/:id", (req, res) => {
    let ps = projectSkills.find(row => row.id === Number(req.params.id));
    ps["projectName"] = projects.find(row => row.id === Number(ps.projectId)).name
    ps["skillName"] = skills.find(row => row.id === Number(ps.skillId)).name
    if (!ps) return res.status(404).send("Not found");
    
    res.render("project-skills/show.ejs", { 
        projectSkill: ps
    });
});


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


// CREATE
// Get the create skill page
app.get("/skills/new",(req,res)=>{
    res.render("skills/index.ejs", {mode: "new"});
    //res.send("Send the create skill page");
});

// Save the new skill from the create form
app.post("/skills/new",(req,res)=>{
    //res.send("Save the new skill");
    res.redirect("/skills");
});


// READ
// Get all skills
app.get("/skills",(req,res)=>{
    res.render("skills/index.ejs", {mode: "list", skills });
});

// Get one skill by id
app.get("/skills/:id",(req,res)=>{
    const skill = skills.find((s) => s.id === Number(req.params.id));
    if (!skill) return res.status(404).send("Skill not found");
    res.render("skills/index.ejs", {mode: "show", skill });
});


// UPDATE
// Get the edit page for one skill
app.get("/skills/:id/edit", (req,res)=>{
    const skill = skills.find((s) => s.id === Number(req.params.id));
    if (!skill) return res.status(404).send("Skill not found");
    res.render("skills/index.ejs", {mode: "edit", skill });
});

// Save the edit form for one skill
app.post("/skills/:id/edit",(req,res)=>{
    //res.send(`Save the edits to skill ${req.params.id}`);
    res.redirect(`/skills/${req.params.id}`);
});


//DELETE
// Save the delete form for one skill
app.post("/skills/:id/delete",(req,res)=>{
    //res.send(`Delete skill ${req.params.id}`);
    res.redirect("/skills")
});



app.post("/project-skills", (req, res) => {
    console.log("Adding new project skill:", req.body);
    const nextProjectSkillId = projectSkills.length > 0 
        ? Math.max(...projectSkills.map(ps => ps.id)) + 1 
        : 1;
    const newProjectSkill = {
        id: nextProjectSkillId,
        projectId: Number(req.body.projectId),
        skillId: Number(req.body.skillId),
        importance: req.body.importance,
        minimumProficiency: req.body.minimumProficiency
    };

    projectSkills.push(newProjectSkill);

    res.redirect("/project-skills");
});

app.get("/project-skills/edit/:id", (req, res) => {
    const ps = projectSkills.find(row => row.id === Number(req.params.id));
    if (!ps) return res.status(404).send("Not found");
    
    res.render("project-skills/edit.ejs", { 
        projectSkill: ps, 
        projects, 
        skills 
    });
});

app.post("/project-skills/edit/:id", (req, res) => {
    console.log(`Editing project skill ${req.params.id}:`, req.body);

    const idToEdit = Number(req.params.id);
    const skillIndex = projectSkills.findIndex(row => row.id === idToEdit);

    if (skillIndex !== -1) {
        // 2. Update its properties
        projectSkills[skillIndex].projectId = Number(req.body.projectId);
        projectSkills[skillIndex].skillId = Number(req.body.skillId);
        projectSkills[skillIndex].importance = req.body.importance;
        projectSkills[skillIndex].minimumProficiency = req.body.minimumProficiency;
    }

    res.redirect("/project-skills");
});

app.post("/project-skills/delete/:id", (req, res) => {
    console.log(`Deleting project skill ${req.params.id}`);
    const idToDelete = Number(req.params.id);

    const skillIndex = projectSkills.findIndex(row => row.id === idToDelete);

    if (skillIndex !== -1) {
        // 2. Use splice to remove 1 item at that index
        projectSkills.splice(skillIndex, 1);
    }

    res.redirect("/project-skills");
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
    res.send(`Page to view person-skill association with id ${req.params.id}`);
});


// ===== PROJECT TYPES (Issue #14) =====

// Create lives in a modal on the list page, so this route just sends you there
app.get("/project-types/new", (req, res) => {
    res.redirect("/project-types");
});

// Save the new project type
app.post("/project-types/new", (req, res) => {
    console.log("New project type saved:", req.body);
    res.redirect("/project-types");
});

// List every project type
app.get("/project-types", (req, res) => {
    res.render("project-types/index", { projectTypes });
});

// Show the edit form for one project type
app.get("/project-types/edit/:id", (req, res) => {
    const projectType = projectTypes.find((t) => t.id === parseInt(req.params.id));
    if (!projectType) {
        return res.status(404).send("Project type not found");
    }
    res.render("project-types/edit", { projectType });
});

// Save the edit form
app.post("/project-types/edit/:id", (req, res) => {
    console.log(`Edited project type ${req.params.id}:`, req.body);
    res.redirect("/project-types");
});

// Delete one project type
app.post("/project-types/delete/:id", (req, res) => {
    console.log("Deleted project type:", req.params.id);
    res.redirect("/project-types");
});

// Show one project type
app.get("/project-types/:id", (req, res) => {
    const projectType = projectTypes.find((t) => t.id === parseInt(req.params.id));
    if (!projectType) {
        return res.status(404).send("Project type not found");
    }
    const skillNames = projectType.typicalSkillIds.map((id) => skills.find((skill) => skill.id === id).name);
    res.render("project-types/show", { projectType, skillNames });
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


// ===== PEOPLE (Issue #18) =====

app.get("/people/new", (req, res) => {
  res.render("people/index", {
    people,
    openCreateModal: true,
    personSubmitted: false,
    personDeleted: false
  });
});

app.post("/people/new", (req, res) => {
  console.log("Submitted new person:", req.body.firstName);

  res.render("people/index", {
    people,
    openCreateModal: false,
    personSubmitted: true,
    personDeleted: false
  });
});

app.get("/people", (req, res) => {
  const sortedPeople = [...people].sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  res.render("people/index", {
    people: sortedPeople,
    openCreateModal: false,
    personSubmitted: false,
    personDeleted: false
  });
});

app.get("/people/edit/:id", (req, res) => {
  const person = people.find((p) => p.id === Number(req.params.id));
  if (!person) return res.status(404).send("404 Person not found");

  res.render("people/edit", { person, submitted: false });
});

app.post("/people/edit/:id", (req, res) => {
  const person = people.find((p) => p.id === Number(req.params.id));
  if (!person) return res.status(404).send("Person not found");

  console.log("Submitted email:", req.body.email);

  res.render("people/edit", { person, submitted: true });
});

app.post("/people/delete/:id", (req, res) => {
  const person = people.find((p) => p.id === Number(req.params.id));
  if (!person) return res.status(404).send("Person not found");

  console.log("Delete requested for person ID:", person.id);

  res.render("people/index", {
    people,
    openCreateModal: false,
    personSubmitted: false,
    personDeleted: true
  });
});

app.get("/people/:id", (req, res) => {
  const person = people.find((p) => p.id === Number(req.params.id));
  if (!person) return res.status(404).send("Person not found");

  res.render("people/show", { person });
});

// ==================== DOCUMENTS ====================

// View all documents
app.get("/documents", (req, res) => {
    console.log("DOCUMENTS ROUTE REACHED");
    
    const documentList = documents.map((document) => {
        const project = projects.find((p) => p.id === document.projectId);
        const uploader = people.find((p) => p.id === document.personId);

        return {
            ...document,
            projectName: project ? project.name : "Unknown Project",
            uploaderName: uploader
                ? `${uploader.firstName} ${uploader.lastName}`
                : "Unknown"
        };
    });

    res.render("documents/index", {
        documents: documentList,
        projects,
        people
    });
});

// Add a document
app.post("/documents/new", (req, res) => {
    console.log("Document submitted:", req.body.name);
    res.redirect("/documents");
});

// Edit document page
app.get("/documents/edit/:id", (req, res) => {
    const documentId = Number(req.params.id);
    const document = documents.find((d) => d.id === documentId);

    if (!document) {
        return res.status(404).send("Document not found");
    }

    res.render("documents/edit", {
        document,
        projects,
        people
    });
});

// Submit document edits
app.post("/documents/edit/:id", (req, res) => {
    console.log("Edited document:", req.body.name);
    res.redirect("/documents");
});

// Delete document
app.post("/documents/delete/:id", (req, res) => {
    const documentId = Number(req.params.id);
    console.log("Delete document:", documentId);
    res.redirect("/documents");
});

// View one document
app.get("/documents/:id", (req, res) => {
    const documentId = Number(req.params.id);
    const document = documents.find((d) => d.id === documentId);

    if (!document) {
        return res.status(404).send("Document not found");
    }

    const project = projects.find((p) => p.id === document.projectId);
    const uploader = people.find((p) => p.id === document.personId);

    res.render("documents/show", {
        document,
        project,
        uploader
    });
});

// Start listening
app.listen(PORT, () => {
    console.log(`App is listening on http://localhost:${PORT}`);
});
