// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));


// create project skills
app.get("/project-skills/create",(req,res)=>{
    res.send("create project skills");
});

app.post("/project-skills",(req,res)=>{
    res.send("new project skills saved");
});


// view the skills 
app.get("/project-skills", (req,res) => {
    res.send("view project skills");
});

app.get("/project-skills/:id",(req,res)=>{
    res.send(`view project skills with id: ${req.params.id}`);
});


// update skills 
app.get("/project-skills/:id/edit",(req,res)=>{
    res.send(`edit project skills with id: ${req.params.id}`);
});

app.post("/project-skills/:id/edit",(req,res)=>{
    res.send(`project skills with id: ${req.params.id} updated`);
});


// delete skills 
app.get("/project-skills/:id/delete",(req,res)=>{
    res.send(`delete project skills with id: ${req.params.id}`);
});


// Start listening
app.listen(PORT,()=>{
    console.log(`App is live: http://localhost:${PORT}`)
})

