// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));

app.get("/project/new",(req,res)=>{
    res.send("Create a project page")
})

app.get("/projects/edit/:id",(req,res)=>{
    res.send("Edit specific project "+req.params.id)
})

app.post("/projects/new",(req,res)=>{
    console.log(req.body)
    res.send("Saving a new project");
});

app.post("/projects/edit/:id",(req,res)=>{
    // I didn't catch this part
})

// Start listening
app.listen(PORT,()=>{
    console.log(`App is live: http://localhost:${PORT}`)
})