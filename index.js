// Import required software
const express = require("express");
const app = express();
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




// Start listening
app.listen(PORT,()=>{
    console.log(`App is live: http://localhost:${PORT}`)
})