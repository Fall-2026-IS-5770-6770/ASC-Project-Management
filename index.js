const express = require("express");
let app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));
// TASK 12: TRACKIN PEOPLE (MENTORS/STUDENTS) ASSOCIATED WITH PROJECTS

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
app.get("/projects/:projectid/people", (req, res) => {
    res.send("Show all people associated with a given project ID")
})

//  form to create a relationship
app.get("/projects/:projectid/people/new", (req, res) => {
    res.send("Show the form for creating a new relationship between a person and the selected project")
})

// POST to save new relationship
app.post("/projects/:projectid/people", (req, res) => {
    res.send("Saved a new relationship between a person and project " + req.params.projectid)
})

// get to view a specific relationship (person to project)
app.get("/projects/:projectid/people/:relationshipid", (req, res) => {
    res.send("Show a specific relationship between a person and the chosen project")
})

// get the form to edit a relationship
app.get("/projects/:projectid/people/:relationshipid/edit", (req, res) => {
    res.send("Edit the relationship between a person and the selected project")
})

// POST to save edited relationship
app.post("/projects/:projectid/people/:relationshipid", (req, res) => {
    res.send("Saved an updated relationship " + req.params.relationshipid + " for project " + req.params.projectid)
})

// POST to delete a relationship
app.post("/projects/:projectid/people/:relationshipid/delete", (req, res) => {
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
    res.send("This route returns thread ", req.params.id);
});

// create a thread
app.post("/threads",(req,res)=>{
    res.send("POST request called")
})

// edit a thread
app.put("/threads/:id",(req,res)=>{
    console.log(req.params.id);
    res.send("This route edits thread ", req.params.id);
})

// delete a thread
app.delete("/threads/:id",(req,res)=>{
    console.log(req.params.id);
    res.send("This route deletes thread ", req.params.id);
})

app.get("/project/new",(req,res)=>{
    res.send("Create a project page")
})

// Start listening
app.listen(PORT, () => {
    console.log(`App is listening on http://localhost:${PORT}`);
});
