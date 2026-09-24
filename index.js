// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));


// GET statuses

app.get("/projects/status", (req, res)=>{
    res.send("This is the status page, statuses can be viewed here.");
});

// POST statuses (to create statuses given a project id)

app.get("/projects/status/edit/:id", (req, res) => {
    const id = req.params.id;

    res.send(`
        <h1>Edit project status of project ${id}</h1>

        <form action="/projects/status/edit/${id}" method="POST">
            <label for="status">New Status:</label>
            <input type="text" id="status" name="status">

            <button type="submit">Save Status</button>
        </form>
    `);
});

app.post("/projects/status/edit/:id", (req, res) => {
    const id = req.params.id;
    const newStatus = req.body.status;

    console.log("Project id:", id);
    console.log("New status:", newStatus);

    res.send(`Project ${id} now has status: ${newStatus}`);
});

// DELETE statuses (given a specific project id)

app.get("/projects/status/delete/:id", (req, res)=>{
    const id = req.params.id
    
     res.send(`
        <h1>Delete project status</h1>
        <p>This page will delete the project status of project ${id}</p>

        <button onclick="deleteStatus()">Delete Status</button>

        <script>
            function deleteStatus() {
                fetch("/projects/status/delete/${id}", {
                    method: "DELETE"
                });
            }
        </script>
    `);

});

app.delete("/projects/status/delete/:id", (req, res) => {
    const id = req.params.id;
    
    console.log("Deleted status for project ID: "+id)

});



// Start listening
app.listen(PORT,()=>{
    console.log(`App is live: http://localhost:${PORT}`)
})
const express = require("express");
let app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));
// TASK 12: TRACKIN PEOPLE (MENTORS/STUDENTS) ASSOCIATED WITH PROJECTS

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

app.listen(PORT,()=>{
    console.log(`App is listening on http://localhost:${PORT}`)
})
