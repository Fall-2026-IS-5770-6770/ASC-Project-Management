// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));

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

// Start listening
app.listen(PORT, () => {
    console.log(`App is live: http://localhost:${PORT}`);
});