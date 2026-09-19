// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));


//C - create a new person
app.get("/people/new", (req,res)=>{
    res.send("Create a new person");
})

app.post("/people/new", (req,res)=>{
    console.log(req.body);
    res.send("Saving a new person");
})


//R - view all/view a new person
app.get("/people/view/:id", (req,res)=>{
    res.send(`View a specific person with id: ${req.params.id}`);
})

app.get("/people/view", (req,res)=>{
    res.send("View all people");
})


//U - edit a person
app.get("/people/edit/:id", (req,res)=>{
    res.send(`Edit a person with id: ${req.params.id}`);
})

app.post("/people/edit/:id", (req,res)=>{
    console.log(req.body)
    res.send(`Saving edits on a person with id: ${req.params.id}`)
})

//D - delete a person
app.post("/people/delete/:id", (req,res)=>{
    console.log(req.body);
    res.send(`Deleting a person with id: ${req.params.id}`);
})


// Start listening
app.listen(PORT,()=>{
    console.log(`App is live: http://localhost:${PORT}`)
})
