// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({ extended: true }));

app.get("/projects/new", (req, res) => {
    res.send("Send the create project page.")
})

app.post("/projects/new", (req, res) => {
    console.log(req.body);
    res.send("Saving a new project.");
})

app.get("/projects/edit/:id", (req, res) => {
    res.send("Edit a project page:" + req.params.id);
})

app.post("/projects/edit/:id", (req, res) => {
    res.send("Saving the changes to project:" + req.params.id);
})

app.delete("/projects/delete/:id", (req, res) => {
    res.send("Deleting a project:" + req.params.id);
})

// Start listening
app.listen(PORT, () => {
    console.log(`App is live: http://localhost:${PORT}`)
})