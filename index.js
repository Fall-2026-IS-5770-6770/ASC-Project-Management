const express = require("express");
const statuses = require("./data/statuses.js");

// required data for threads
const threads = require("./data/threads");
const people = require("./data/people");


const app = express();
const PORT = 3000;

app.set("view engine", "ejs");

// use the public folder
app.use(express.static("public"));

// Allow body encoding for POST Requests
app.use(express.urlencoded({ extended: true }));

// This is a server-rendered app, so browsers can only send GET and POST.
// Every resource follows the same pattern:
//   GET  /thing/new         -> create form       POST /thing/new         -> save new
//   GET  /thing/edit/:id    -> edit form         POST /thing/edit/:id    -> save edit
//                                                POST /thing/delete/:id  -> delete (confirmed on the frontend)
// Static paths (new, edit, all) must be registered before /:id so they aren't shadowed.


// ===== PROJECTS (Issue #1) =====

// Get the create project page
app.get("/projects/new", (req, res) => {
    res.send("Send the create project page");
});

// Save the new project from the create form
app.post("/projects/new", (req, res) => {
    console.log(req.body);
    res.send("Save the new project");
});

// Get all projects
app.get("/projects", (req, res) => {
    res.send("Send all of the projects");
});

// Get the edit page for one project
app.get("/projects/edit/:id", (req, res) => {
    res.send(`Send the edit page for project ${req.params.id}`);
});

// Save the edit form for one project
app.post("/projects/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Save the edits to project ${req.params.id}`);
});

// Delete one project by id
app.post("/projects/delete/:id", (req, res) => {
    res.send(`Delete project ${req.params.id}`);
});

// Get one project by id
app.get("/projects/:id", (req, res) => {
    res.send(`Send project ${req.params.id}`);
});


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
    res.send("Create mentors page");
});

app.post("/mentors/new", (req, res) => {
    console.log(req.body);
    res.send("Saving a new mentor");
});

app.get("/mentors", (req, res) => {
    res.send("Get all mentors");
});

app.get("/mentors/edit/:id", (req, res) => {
    res.send(`Edit mentor page for mentor ${req.params.id}`);
});

app.post("/mentors/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Saving an edit on mentor ${req.params.id}`);
});

app.post("/mentors/delete/:id", (req, res) => {
    res.send(`Deleting mentor ${req.params.id}`);
});

app.get("/mentors/:id", (req, res) => {
    res.send(`Getting mentor ${req.params.id}`);
});


// ===== STUDENTS (Issue #5) =====

app.get("/students/new", (req, res) => {
    res.send("This is the new student form page");
});

app.post("/students/new", (req, res) => {
    console.log(req.body);
    res.send("This saves the new student form data to the database");
});

app.get("/students", (req, res) => {
    res.send("This shows a list of all students");
});

app.get("/students/edit/:id", (req, res) => {
    res.send(`This is the edit form for student with id ${req.params.id}`);
});

app.post("/students/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`This updates the student with id ${req.params.id} in the database`);
});

app.post("/students/delete/:id", (req, res) => {
    res.send(`This deletes the student with id ${req.params.id} from the database`);
});

app.get("/students/:id", (req, res) => {
    res.send(`This shows the details for student with id ${req.params.id}`);
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
    res.send("Create a new person");
});

app.post("/people/new", (req, res) => {
    console.log(req.body);
    res.send("Saving a new person");
});

app.get("/people", (req, res) => {
    res.send("View all people");
});

app.get("/people/edit/:id", (req, res) => {
    res.send(`Edit a person with id: ${req.params.id}`);
});

app.post("/people/edit/:id", (req, res) => {
    console.log(req.body);
    res.send(`Saving edits on a person with id: ${req.params.id}`);
});

app.post("/people/delete/:id", (req, res) => {
    res.send(`Deleting a person with id: ${req.params.id}`);
});

app.get("/people/:id", (req, res) => {
    res.send(`View a specific person with id: ${req.params.id}`);
});


// Start listening
app.listen(PORT, () => {
    console.log(`App is listening on http://localhost:${PORT}`);
});
