// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));

app.get("/mentors/new", (req, res) => {
    res.send("Create mentors page")
});

app.post("/mentors/new", (req, res) => {
    console.log(req.body);
    res.send("Saving a new mentor");
});



app.get("/mentors/:id", (req,res) => {
    res.send("getting a mentor " + req.params.id)
});

app.get("/mentors", (req, res) => {
    res.send("get all mentors");
});



app.get("/mentors/edit", (req, res) => {
    res.send("Edit a Mentor Page");
})
app.post("/mentors/edit", (req, res) => {
    console.log(res.body);
    res.send("Saving an edit on a mentor");
})

app.post("mentors/:id/delete", (req, res) => {
    console.log(res.body);
    res.send("deleting a mentor by Id: " + req.params.id);
})


// Start listening
app.listen(PORT,()=>{
    console.log(`App is live: http://localhost:${PORT}`)
})