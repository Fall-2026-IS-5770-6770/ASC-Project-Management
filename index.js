// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));

// CREATE
app.get("/students/new", (req, res) => {
    res.send("This is the new student form page")
})

app.post("/students", (req, res) => {
    console.log(req.body)
    res.send("This saves the new student form data to the database")
})

// VIEW ALL
app.get("/students", (req, res) => {
    res.send("This shows a list of all students")
})

// VIEW ONE
app.get("/students/:id", (req, res) => {
    res.send(`This shows the details for student with id ${req.params.id}`)
})

// EDIT
app.get("/students/:id/edit", (req, res) => {
    res.send(`This is the edit form for student with id ${req.params.id}`)
})

app.put("/students/:id", (req, res) => {
    console.log(req.body)
    res.send(`This updates the student with id ${req.params.id} in the database`)
})

// DELETE
app.delete("/students/:id", (req, res) => {
    res.send(`This deletes the student with id ${req.params.id} from the database`)
})

// Start listening
app.listen(PORT,()=>{
    console.log(`App is live: http://localhost:${PORT}`)
})