// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));

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
app.listen(PORT,()=>{
    console.log(`App is live: http://localhost:${PORT}`)
})