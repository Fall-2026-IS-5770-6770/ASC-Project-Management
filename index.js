const express = require("express");
let app = express();
const PORT = 3000;


const projectPeople = require("./data/projectPeople");
const projects = require("./data/projects");
const people = require("./data/people");

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");




// viewing all
app.get("/projects/people", (req, res) => {
    res.render("people-projects/index.ejs", {
        rows: projectPeople,
        people: people,
        projects: projects
    });
})

// POST to save new relationship
app.post("/projects/people", (req, res) => {
    console.log("Attempted relationship creation");
    res.redirect("/projects/people/");
})

// get to view a specific relationship (person to project)
app.get("/projects/people/:relationshipid", (req, res) => {
    const rows = projectPeople.find((pp) => pp.id === Number(req.params.relationshipid));
    const person = people.find((ps) => ps.id === rows.personId);
    const project = projects.find((pr) => pr.id === rows.projectId);

    res.render("single-person-project/index.ejs", {
        rows: rows,
        person: person,
        project: project
    });
})

// get the form to edit a relationship
app.get("/projects/people/:relationshipid/edit", (req, res) => {
    const row = projectPeople.find((pp) => pp.id === Number(req.params.relationshipid));

    res.render("edit-ppl-project/index.ejs", {
        row: row,
        people: people,
        projects: projects
    });
})

// POST to save edited relationship
app.post("/projects/people/:relationshipid", (req, res) => {
    console.log("Attempted edit for relationship", req.params.relationshipid, ":", req.body.role, "| Project", req.body.projectId, "| Person", req.body.personId);
    res.redirect("/projects/people/" + req.params.relationshipid);
})

// POST to delete a relationship
app.post("/projects/people/:relationshipid/delete", (req, res) => {
    console.log("Attempted deletion for relationship", req.params.relationshipid);
    res.redirect("/projects/people/");
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
