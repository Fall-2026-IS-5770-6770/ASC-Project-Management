const express = require("express");
const projects = require("./data/projects.js");
const projectStatus = require("./data/projectStatuses.js");
const statuses = require("./data/statuses.js");

const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({ extended: true }));

app.get('/project/type', (req, res) => {
    res.send("List of the available types of Projects")
})

app.get('/project/type/create', (req, res) => {
    res.send("Create Project type")
})

app.post('/project/type/create', (req, res) => {
    res.send("Project type created")
})

app.get('/project/type/:id', (req, res) => {
    res.send("Project type details")
})

app.put('/project/type/:id', (req, res) => {
    res.send("Project type updated")
})

app.delete('/project/type/:id', (req, res) => {
    res.send("Delete Project type")
})

// TASK 12: TRACKING PEOPLE (MENTORS/STUDENTS) ASSOCIATED WITH PROJECTS

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
                    <strong>${status.id}:</strong> ${status.name} 
                    <a href="/status/edit/${status.id}"><button>Edit</button></a>
                    <a href="/status/delete/${status.id}"><button>Delete</button></a>
                </div>
            `;
        })
        .join("");
        
    const statusMessage = statusMessagePrefix + statusMessageSuffix + "</body></html>";
    
    resp.send(statusMessage);
});

app.get('/status/new', (req, res) => {
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
                <input type="text" placeholder="Status Order" name="status_order">
                <input type="submit" value="Save">
            </form>
        </body>
        </html>
    `);
});

app.post("/status/new", (req, resp) => {
    try {
        const statusName = req.body.status_name;
        const statusDescription = req.body.status_description;
        
        if (!statusName || !statusDescription) {
            return resp.status(400).json({ error: "Missing required fields: status_name or status_description" });
        }
        
        const newStatusId = statuses.length + 1;
        
        const statusOrder = req.body.status_order ? Number(req.body.status_order) : newStatusId;
        
        const newStatus = {
            id: newStatusId,
            name: statusName,
            description: statusDescription,
            order: statusOrder
        };
        
        statuses.push(newStatus);
        resp.status(201).json(newStatus);
        
    } catch (error) {
        resp.status(500).json({ error: error.message });
    }
});

app.get("/status/:id", (req, resp) => {
    const statusId = Number(req.params.id);
    const selectedStatus = statuses.find(status => status.id === statusId);

    if (!selectedStatus) {
        resp.status(404).send(`Status with id of ${statusId} not found`);
    }
    else {
        resp.status(200).json(selectedStatus);
    }
});

app.get("/status/edit/:id", (req, resp) => {
    const statusId = Number(req.params.id);
    const selectedStatus = statuses.find(status => status.id === statusId);

    if (!selectedStatus) {
        resp.status(404).json({error: `Status with id ${statusId} not found`});
    }
    else {
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
            </body>
            </html>
        `);
    }
});

app.post("/status/edit/:id", (req, resp) => {
    try {
        const statusId = Number(req.params.id);
        const statusIndex = statuses.findIndex(status => status.id === statusId);

        if (statusIndex === -1) {
            return resp.status(404).json({error: `Status with id ${statusId} not found`});
        }

        const { status_name, status_description, status_order } = req.body;

        if (!status_name) {
            return resp.status(400).json({ error: "Missing name for status" });
        }
        
        if (!status_description) {
            return resp.status(400).json({ error: "Missing description for status" });
        }

        // Update the status in the array
        statuses[statusIndex].name = status_name;
        statuses[statusIndex].description = status_description;
        statuses[statusIndex].order = status_order ? Number(status_order) : statuses[statusIndex].order;

        resp.status(200).json({
            message: `Status with id ${statusId} updated successfully`,
            status: statuses[statusIndex]
        });

    } catch (error) {
        resp.status(500).json({ error: error.message });
    }
});

app.get("/status/delete/:id", (req, resp) => {
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
            <title>Confirm Deletion</title>
        </head>
        <body>
            <h2>Delete Status</h2>
            <p>Are you sure you want to permanently delete the status: <strong>${selectedStatus.name}</strong> (ID: ${selectedStatus.id})?</p>
            
            <form action="/status/delete/${selectedStatus.id}" method="POST" style="display: inline;">
                <button type="submit" style="color: red;">Confirm Delete</button>
            </form>
            
            <a href="/statuses"><button type="button">Cancel</button></a>
        </body>
        </html>
    `);
});

app.post("/status/delete/:id", (req, resp) => {
    try {
        const statusId = Number(req.params.id);
        const statusIndex = statuses.findIndex(status => status.id === statusId);

        if (statusIndex === -1) {
            return resp.status(404).json({ error: `Status with id ${statusId} not found` });
        }

        // Remove 1 element at the found index
        const deletedStatus = statuses.splice(statusIndex, 1);

        resp.status(200).json({
            message: `Status with id ${statusId} deleted successfully`,
            deleted: deletedStatus[0]
        });

    } catch (error) {
        resp.status(500).json({ error: error.message });
    }
});

// View all communication channels
app.get("/channels/all", (req, res) => {
    res.send("Viewing all channels");
});

// Create a new communication channel
app.get("/channels/new", (req, res) => {
    res.send("Send the create channel page");
});

// View a specific communication channel
app.get("/channels/:id", (req, res) => {
    res.send("Viewing channel with ID: " + req.params.id);
});

// Save a new communication channel
app.post("/channels/new", (req, res) => {
    console.log(req.body);
    res.send("Saving a new channel");
});

// Edit a specific communication channel
app.get("/channels/edit/:id", (req, res) => {
    res.send("Edit specific channel with ID: " + req.params.id);
});

// Save the edited communication channel
app.post("/channels/edit/:id", (req, res) => {
    console.log(req.body);
    res.send("Saving the edited channel " + req.params.id);
});

// Showing confirmation for a specific communication channel to be deleted
app.get("/channels/delete/:id", (req, res) => {
    res.send("Showing what channel will be deleted")
});

// Delete a specific communication channel
app.post("/channels/delete/:id", (req, res) => {
    res.send("Deleting channel:" + req.params.id);
});

// *** view clients ***
//view all clients
app.get('/clients/all', (req, res)=> {
    res.send('Viewing all clients')
})

//view a specific client
app.get('/clients/view/:id', (req, res)=> {
    res.send('Viewing a specific client '+req.params.id)
})

// *** handle new client ***
// new client page 
app.get('/clients/new', (req, res)=> {
    res.send('Send the new client page')
})

// form submission for creating a new client 
app.post('/clients/new', (req, res)=> {
    console.log(req.body);
    res.send('Saving a new client')
})

// *** edit existing clients ***
// edit client page by id
app.get('/clients/edit/:id', (req, res) => {
    res.send('Edit specific clients '+req.params.id)
})

// post request for edited clients 
app.post('/clients/edit/:id', (req, res)=> {
    console.log(req.body)
    res.send('Saving edits to a client '+req.params.id)
})

// *** handle delete client ***
// display clients to be deleted
app.get('/clients/delete/:id', (req, res)=> {
    res.send('displaying client that will be deleted '+req.params.id)
})

// delete request for client 
app.post('/clients/delete/:id', (req, res)=> {
    res.send('deleting client '+req.params.id)
})

// CREATE
app.get("/students/new", (req, res) => {
    res.send("This is the new student form page")
})

app.post("/students", (req, res) => {
    console.log(req.body)
    res.send("This saves the new student form data to the database")
})

// VIEW ALL
app.get("/students", (req, res) => {
    res.send("This shows a list of all students")
})

// VIEW ONE
app.get("/students/:id", (req, res) => {
    res.send(`This shows the details for student with id ${req.params.id}`)
})

// EDIT
app.get("/students/:id/edit", (req, res) => {
    res.send(`This is the edit form for student with id ${req.params.id}`)
})

app.put("/students/:id", (req, res) => {
    console.log(req.body)
    res.send(`This updates the student with id ${req.params.id} in the database`)
})

// DELETE
app.delete("/students/:id", (req, res) => {
    res.send(`This deletes the student with id ${req.params.id} from the database`)
})

app.get("/projects/edit/:id", (req, res) => {
    res.type("text").send("Edit specific project"+req.params.id);
});

app.post("/projects/edit/:id", (req, res) => {
    console.log(req.body);
    res.send("Updating project with ID "+req.params.id);
});

// viewing all
app.get('/projects/:projectid/people', (req, res) => {
    res.send("Show all people associated with a given project ID")
})

// form to create a relationship
app.get('/projects/:projectid/people/new', (req, res) => {
    res.send("Show the form for creating a new relationship between a person and the selected project")
})

// POST to save new relationship
app.post('/projects/:projectid/people', (req, res) => {
    res.send("Saved a new relationship between a person and project " + req.params.projectid)
})

// get to view a specific relationship (person to project)
app.get('/projects/:projectid/people/:relationshipid', (req, res) => {
    res.send("Show a specific relationship between a person and the chosen project")
})

// get the form to edit a relationship
app.get('/projects/:projectid/people/:relationshipid/edit', (req, res) => {
    res.send("Edit the relationship between a person and the selected project")
})

// POST to save edited relationship
app.post('/projects/:projectid/people/:relationshipid', (req, res) => {
    res.send("Saved an updated relationship " + req.params.relationshipid + " for project " + req.params.projectid)
})

// POST to delete a relationship
app.post('/projects/:projectid/people/:relationshipid/delete', (req, res) => {
    res.send("Deleted a relationship between a person and project " + req.params.projectid)
})

// Store messages
let messages = [];

// Create a message
app.post("/messages", (req, res) => {
    messages.push(req.body);
    res.send("Message created");
});

// View all messages
app.get("/messages", (req, res) => {
    res.send(messages);
});

// View a specific message
app.get("/messages/:id", (req, res) => {
    res.send(messages[req.params.id]);
});

// Edit a message
app.put("/messages/:id", (req, res) => {
    messages[req.params.id] = req.body;
    res.send("Message updated");
});

// Delete a message
app.delete("/messages/:id", (req, res) => {
    messages.splice(req.params.id, 1);
    res.send("Message deleted");
});



// create project skills
app.get("/project-skills/create",(req,res)=>{
    res.send("create project skills");
});

app.post("/project-skills",(req,res)=>{
    res.send("new project skills saved");
});


// view the skills 
app.get("/project-skills", (req,res) => {
    res.send("view project skills");
});

app.get("/project-skills/:id",(req,res)=>{
    res.send(`view project skills with id: ${req.params.id}`);
});


// update skills 
app.get("/project-skills/:id/edit",(req,res)=>{
    res.send(`edit project skills with id: ${req.params.id}`);
});

app.post("/project-skills/:id/edit",(req,res)=>{
    res.send(`project skills with id: ${req.params.id} updated`);
});


// delete skills 
app.get("/project-skills/:id/delete",(req,res)=>{
    res.send(`delete project skills with id: ${req.params.id}`);
});


// CREATE
// Get the create project page
app.get("/projects/new",(req,res)=>{
    res.send("Send the create project page");
});

// Save the new project from the create form
app.post("/projects/new",(req,res)=>{
    res.send("Save the new project");
});


// READ
// Get all projects
app.get("/projects",(req,res)=>{
    res.send("Send all of the projects");
});

// Get one project by id
app.get("/projects/:id",(req,res)=>{
    res.send(`Send project ${req.params.id}`);
});


// UPDATE
// Get the edit page for one project
app.get("/projects/:id/edit",(req,res)=>{
    res.send(`Send the edit page for project ${req.params.id}`);
});

// Save the edit form for one project
app.post("/projects/:id/edit",(req,res)=>{
    res.send(`Save the edits to project ${req.params.id}`);
});


// DELETE
// Delete one project by id
app.post("/projects/:id/delete",(req,res)=>{
    res.send(`Delete project ${req.params.id}`);
});


// view all
app.get("/threads",(req,res)=>{
    res.send("This route sends all threads");
});

// view one
app.get("/threads/:id",(req,res)=>{
    console.log(req.params.id);
    res.send(`This route returns thread ${req.params.id}`);
});

// create a thread
app.post("/threads",(req,res)=>{
    res.send("POST request called");
});

// edit a thread
app.put("/threads/:id",(req,res)=>{
    console.log(req.params.id);
    res.send(`This route edits thread ${req.params.id}`);
});

// delete a thread
app.delete("/threads/:id",(req,res)=>{
    console.log(req.params.id);
    res.send(`This route deletes thread ${req.params.id}`);
});

app.get("/project/new",(req,res)=>{
    res.send("Create a project page")
})

// Routes for tracking associations between people and their skills
app.get("/person-skill/new", (req, res) => {
    res.send("Page to create new person-skill association");
});

app.post("/person-skill/new", (req, res) => {
    console.log(req.body) // Data for new association
    res.send("Save new person-skill association");
});

app.get("/person-skill/all", (req, res) => {
    res.send("Page to view all person-skill associations");
});

app.get("/person-skill/:id", (req, res) => {
    res.send(`Page to view person-skill association with id ${req.params.id}`);
});

app.get("/person-skill/edit/:id", (req, res) => {
    res.send(`Page to edit person-skill association with id ${req.params.id}`);
});

app.post("/person-skill/edit/:id", (req, res) => {
    console.log(req.body) // Data for edit
    res.send(`Save edit to person-skill association with id ${req.params.id}`);
});

app.post("/person-skill/delete/:id", (req, res) => {
    res.send(`Delete person-skill association with id ${req.params.id}`);
});

// users should be able to create requirements
app.get("/requirements/create", (req, res) => {
    res.send("Create requirements page");
});

// post request for creating a new requirement to save the creation
app.post("/requirements/create", (req, res) => {
    res.send("Create requirement with data: " + JSON.stringify(req.body));
});

// view a specific requirement & get to it by id
app.get("/requirements/:id", (req, res) => {
    res.send("View requirement page for ID: " + req.params.id);
});

// view all requirements/items
app.get("/requirements", (req, res) => {
    res.send("View all requirements");
});

// users should be able to edit existing requirements (get to it by id)
app.get("/requirements/edit/:id", (req, res) => {
    res.send("Edit requirement page for ID: " + req.params.id);
});

// save the edit form
app.post("/requirements/edit/:id", (req, res) => {
    res.send("Save edited requirement with ID: " + req.params.id + " and data: " + JSON.stringify(req.body));
});

// delete requirements that are no longer needed or were created accidentally.
app.post("/requirements/delete/:id", (req, res) => {
    res.send("Delete requirement with ID: " + req.params.id);
});

// Start listening
app.listen(PORT, () => {
    console.log(`App is listening on http://localhost:${PORT}`);
});
