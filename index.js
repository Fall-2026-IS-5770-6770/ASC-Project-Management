// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({ extended: true }));

app.get('/project/type', (req, res) => {
    res.send("List of the available types of Projects")
})

app.get('/project/type/create', (req, res) => {
    res.send("Create Project type")
})

app.post('/project/type/create', (req, res) => {
    res.send("Project type created")
})

app.get('/project/type/:id', (req, res) => {
    res.send("Project type details")
})

app.put('/project/type/:id', (req, res) => {
    res.send("Project type updated")
})

app.delete('/project/type/:id', (req, res) => {
    res.send("Delete Project type")
})



// Start listening
app.listen(PORT, () => {
    console.log(`App is live: http://localhost:${PORT}`)
})