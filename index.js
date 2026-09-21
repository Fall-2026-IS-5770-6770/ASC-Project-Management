const express = require("express");
let app = express();
const PORT = 3000;

app.use((req,res,next)=>{
    console.log("Request was made to "+req.originalUrl);
    console.log(req.body)
    next();
})

app.use(express.urlencoded({extended:true}))

// view all
app.get("/threads",(req,res)=>{
    res.send("This route sends all threads");
});

// view one
app.get("/threads/:id",(req,res)=>{
    console.log(req.params.id);
    res.send("This route returns thread ", req.params.id);
});

// create a thread
app.post("/threads",(req,res)=>{
    res.send("POST request called")
})

// edit a thread
app.put("/threads/:id",(req,res)=>{
    console.log(req.params.id);
    res.send("This route edits thread ", req.params.id);
})

// delete a thread
app.delete("/threads/:id",(req,res)=>{
    console.log(req.params.id);
    res.send("This route deletes thread ", req.params.id);
})

app.listen(PORT,()=>{
    console.log(`App is listening on http://localhost:${PORT}`)
})
