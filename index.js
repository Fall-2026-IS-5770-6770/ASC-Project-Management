// Import required software
const express = require("express");
const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));


// GET statuses

app.get("/projects/status", (req, res)=>{
    res.send("This is the status page, statuses can be viewed here.");
});

// POST statuses (to create statuses given a project id)

app.get("/projects/status/edit/:id", (req, res) => {
    const id = req.params.id;

    res.send(`
        <h1>Edit project status of project ${id}</h1>

        <form action="/projects/status/edit/${id}" method="POST">
            <label for="status">New Status:</label>
            <input type="text" id="status" name="status">

            <button type="submit">Save Status</button>
        </form>
    `);
});

app.post("/projects/status/edit/:id", (req, res) => {
    const id = req.params.id;
    const newStatus = req.body.status;

    console.log("Project id:", id);
    console.log("New status:", newStatus);

    res.send(`Project ${id} now has status: ${newStatus}`);
});

// DELETE statuses (given a specific project id)

app.get("/projects/status/delete/:id", (req, res)=>{
    const id = req.params.id
    
     res.send(`
        <h1>Delete project status</h1>
        <p>This page will delete the project status of project ${id}</p>

        <button onclick="deleteStatus()">Delete Status</button>

        <script>
            function deleteStatus() {
                fetch("/projects/status/delete/${id}", {
                    method: "DELETE"
                });
            }
        </script>
    `);

});

app.delete("/projects/status/delete/:id", (req, res) => {
    const id = req.params.id;
    
    console.log("Deleted status for project ID: "+id)

});



// Start listening
app.listen(PORT,()=>{
    console.log(`App is live: http://localhost:${PORT}`)
})