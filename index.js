// Import required software
const express = require("express");
const projects = require("./data/projects.js");
const projectStatus = require("./data/projectStatuses.js");
const statuses = require("./data/statuses.js");

const app = express();
const PORT = 3000;

// Allow body encoding for POST Requests
app.use(express.urlencoded({extended:true}));

app.get("/statuses", (req, resp) => {
    const statusMessagePrefix = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>All Statuses</title>
        </head>
        <body>
            <h2>All existing project statuses are:</h2>
            <a href="/status/new"><button>Add New</button></a>
            <hr />
    `;
    
    const statusMessageSuffix = statuses
        .map(status => {
            return `
                <div style="margin-bottom: 10px;">
                    <strong>${status.id}:</strong> ${status.name} 
                    <a href="/status/edit/${status.id}"><button>Edit</button></a>
                    <a href="/status/delete/${status.id}"><button>Delete</button></a>
                </div>
            `;
        })
        .join("");
        
    const statusMessage = statusMessagePrefix + statusMessageSuffix + "</body></html>";
    
    resp.send(statusMessage);
});

app.get('/status/new', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Create Status</title>
            </head>
            <body>
            <h2>Create a New Status</h2>
            <form action="/status/new" method="POST">
            <input type="text" placeholder="Status Name" name="status_name" required>
                <input type="text" placeholder="Status Description" name="status_description" required>
                <input type="text" placeholder="Status Order" name="status_order">
                <input type="submit" value="Save">
            </form>
        </body>
        </html>
    `);
});

app.post("/status/new", (req, resp) => {
    try {
        const statusName = req.body.status_name;
        const statusDescription = req.body.status_description;
        
        if (!statusName || !statusDescription) {
            return resp.status(400).json({ error: "Missing required fields: status_name or status_description" });
        }
        
        const newStatusId = statuses.length + 1;
        
        const statusOrder = req.body.status_order ? Number(req.body.status_order) : newStatusId;
        
        const newStatus = {
            id: newStatusId,
            name: statusName,
            description: statusDescription,
            order: statusOrder
        };
        
        statuses.push(newStatus);
        resp.status(201).json(newStatus);
        
    } catch (error) {
        resp.status(500).json({ error: error.message });
    }
});

app.get("/status/:id", (req, resp) => {
    const statusId = Number(req.params.id);
    const selectedStatus = statuses.find(status => status.id === statusId);

    if (!selectedStatus) {
        resp.status(404).send(`Status with id of ${statusId} not found`);
    }
    else {
        resp.status(200).json(selectedStatus);
    }
});

app.get("/status/edit/:id", (req, resp) => {
    const statusId = Number(req.params.id);
    const selectedStatus = statuses.find(status => status.id === statusId);

    if (!selectedStatus) {
        resp.status(404).json({error: `Status with id ${statusId} not found`});
    }
    else {
        resp.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Edit Status</title>
            </head>
            <body>
                <h2>Edit Status: ${selectedStatus.name}</h2>
                <form action="/status/edit/${selectedStatus.id}" method="POST">
                    <input type="text" value="${selectedStatus.name}" name="status_name" required>
                    <input type="text" value="${selectedStatus.description}" name="status_description" required>
                    <input type="number" value="${selectedStatus.order}" name="status_order" required>
                    <input type="submit" value="Update">
                </form>
            </body>
            </html>
        `);
    }
});

app.post("/status/edit/:id", (req, resp) => {
    try {
        const statusId = Number(req.params.id);
        const statusIndex = statuses.findIndex(status => status.id === statusId);

        if (statusIndex === -1) {
            return resp.status(404).json({error: `Status with id ${statusId} not found`});
        }

        const { status_name, status_description, status_order } = req.body;

        if (!status_name) {
            return resp.status(400).json({ error: "Missing name for status" });
        }
        
        if (!status_description) {
            return resp.status(400).json({ error: "Missing description for status" });
        }

        // Update the status in the array
        statuses[statusIndex].name = status_name;
        statuses[statusIndex].description = status_description;
        statuses[statusIndex].order = status_order ? Number(status_order) : statuses[statusIndex].order;

        resp.status(200).json({
            message: `Status with id ${statusId} updated successfully`,
            status: statuses[statusIndex]
        });

    } catch (error) {
        resp.status(500).json({ error: error.message });
    }
});

app.get("/status/delete/:id", (req, resp) => {
    const statusId = Number(req.params.id);
    const selectedStatus = statuses.find(status => status.id === statusId);

    if (!selectedStatus) {
        return resp.status(404).send(`Status with id ${statusId} not found`);
    }

    resp.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirm Deletion</title>
        </head>
        <body>
            <h2>Delete Status</h2>
            <p>Are you sure you want to permanently delete the status: <strong>${selectedStatus.name}</strong> (ID: ${selectedStatus.id})?</p>
            
            <form action="/status/delete/${selectedStatus.id}" method="POST" style="display: inline;">
                <button type="submit" style="color: red;">Confirm Delete</button>
            </form>
            
            <a href="/statuses"><button type="button">Cancel</button></a>
        </body>
        </html>
    `);
});

app.post("/status/delete/:id", (req, resp) => {
    try {
        const statusId = Number(req.params.id);
        const statusIndex = statuses.findIndex(status => status.id === statusId);

        if (statusIndex === -1) {
            return resp.status(404).json({ error: `Status with id ${statusId} not found` });
        }

        // Remove 1 element at the found index
        const deletedStatus = statuses.splice(statusIndex, 1);

        resp.status(200).json({
            message: `Status with id ${statusId} deleted successfully`,
            deleted: deletedStatus[0]
        });

    } catch (error) {
        resp.status(500).json({ error: error.message });
    }
});

// Start listening
app.listen(PORT,()=>{
    console.log(`App is live: http://localhost:${PORT}`)
})