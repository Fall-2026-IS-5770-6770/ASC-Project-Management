const express = require("express");
let app = express();
const PORT = 3000;

const channels = require("./data/channels");
const projects = require("./data/projects");
const people = require("./data/people");

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
<<<<<<< Updated upstream
app.use(express.static('public'));
=======
>>>>>>> Stashed changes
app.set("view engine","ejs");
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
    res.render("projects/index.ejs");
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


/// DELETE
// Delete one project by id
app.post("/projects/:id/delete",(req,res)=>{
    res.send(`Delete project ${req.params.id}`);
});


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

// READ: view one
app.get("/channels/:id",(req,res)=>{
    const channel = channels.find((c) => c.id === Number(req.params.id));
    if (!channel) return res.status(404).send("Channel not found");
    res.render("channels/show.ejs", { channel: withDetails(channel) });
});

// UPDATE: edit page
app.get("/channels/:id/edit",(req,res)=>{
    const channel = channels.find((c) => c.id === Number(req.params.id));
    if (!channel) return res.status(404).send("Channel not found");
    res.render("channels/edit.ejs", { channel: channel, projects: projects });
});

// UPDATE: edit form submits here
app.post("/channels/:id/edit",(req,res)=>{
    console.log(`Edit channel ${req.params.id}, new name:`, req.body.name);
    res.redirect(`/channels/${req.params.id}`);
});

// DELETE
app.post("/channels/:id/delete",(req,res)=>{
    console.log("Delete channel:", req.params.id);
    res.redirect("/channels");
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
