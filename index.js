// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));


// Routes for tracking associations between people and their skills
app.get("/person-skill/new", (req, res) => {
    res.send("Page to create new person-skill association");
});

app.post("/person-skill/new", (req, res) => {
    console.log(req.body) // Data for new association
    res.send("Save new person-skill association");
});

app.get("/person-skill/:id", (req, res) => {
    res.send(`Page to view person-skill association with id ${req.params.id}`);
});

app.get("/person-skill/all", (req, res) => {
    res.send("Page to view all person-skill associations");
});

app.get("person-skill/edit/:id", (req, res) => {
    res.send(`Page to edit person-skill association with id ${req.params.id}`);
});

app.post("person-skill/edit/:id", (req, res) => {
    console.log(req.body) // Data for edit
    res.send(`Save edit to person-skill association with id ${req.params.id}`);
});

app.post("person-skill/delete/:id", (req, res) => {
    res.send(`Delete person-skill association with id ${req.params.id}`);
});


// Start listening
app.listen(PORT,()=>{
    console.log(`App is live: http://localhost:${PORT}`)
})