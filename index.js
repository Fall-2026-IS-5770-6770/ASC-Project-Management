// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));

// create a route to visit a page to create a project 
app.get('/projects/new', (req, res)=> {
    res.send('Send the create project page')
})

// create a route to visit a page to create a project 
app.get('/projects/edit/:id', (req, res)=> {
    res.send('Edit specific project'+req.params.id)
})

// if theres a form on the page, the form will automitcally submit to the same route - forms are submitted through an app.post() request - post request to save new form 
app.post('/projects/new', (req, res) => {
    console.log(req.body)
    res.send('Saving a new project')
})

app.post('/projects/edit/:id', (req, res)=> {
    console.log(req.body)
    res.send('Saving edits on a specific project')
})

// Start listening
app.listen(PORT,()=>{
    console.log(`App is live: http://localhost:${PORT}`)
})