// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));

// *** view clients ***
//view all clients
app.get('/clients/all', (req, res)=> {
    res.send('Viewing all clients')
})

//view a specific client
app.get('/clients/view/:id', (req, res)=> {
    res.send('Viewing a specific client '+req.params.id)
})

// *** handle new client ***
// new client page 
app.get('/clients/new', (req, res)=> {
    res.send('Send the new client page')
})

// form submission for creating a new client 
app.post('/clients/new', (req, res)=> {
    console.log(req.body);
    res.send('Saving a new client')
})

// *** edit existing clients ***
// edit client page by id
app.get('/clients/edit/:id', (req, res) => {
    res.send('Edit specific clients '+req.params.id)
})

// post request for edited clients 
app.post('/clients/edit/:id', (req, res)=> {
    console.log(req.body)
    res.send('Saving edits to a client '+req.params.id)
})

// *** handle delete client ***
// display clients to be deleted
app.get('/clients/delete/:id', (req, res)=> {
    res.send('displaying client that will be deleted')
})

// delete request for client 
app.post('/clients/delete/:id', (req, res)=> {
    res.send('deleting client '+req.params.id)
})


// Start listening
app.listen(PORT,()=>{
    console.log(`App is live: http://localhost:${PORT}`)
})