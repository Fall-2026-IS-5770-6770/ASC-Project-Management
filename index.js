// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));

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


// Start listening
app.listen(PORT,()=>{
    console.log(`App is live: http://localhost:${PORT}`)
})