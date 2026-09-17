// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));


app.get("/projects/new",(req,res)=>{
    res.send("Send the create project page");
});



// Start listening
app.listen(PORT,()=>{
    console.log(`App is live: http://localhost:${PORT}`)
})