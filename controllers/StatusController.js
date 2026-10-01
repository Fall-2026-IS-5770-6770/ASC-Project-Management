
const statuses = require("../data/statuses.js");

// all statuses
function getAllStatuses(req, res){
    const list = statuses
        .map(s => `<p>${s.id}: <a href="/status/${s.id}">${s.name}</a></p>`)
        .join("");
    res.send(`<h2>All statuses</h2><a href="/status/new">Add New</a>${list}`);
}

// create status page
function getNewStatusForm(req, res){
    res.send(`
        <h2>Create a status</h2>
        <form action="/status/new" method="POST">
            <input name="status_name" placeholder="Name" required>
            <input name="status_description" placeholder="Description" required>
            <input name="status_order" type="number" placeholder="Order">
            <button>Save</button>
        </form>
    `);
}

// save the new status 
function createStatus(req, res){
    const { status_name, status_description, status_order } = req.body;

    if (!status_name || !status_description) {
        return res.status(400).send("Missing required fields: status_name or status_description");
    }

    const newId = statuses.reduce((max, s) => Math.max(max, s.id), 0) + 1;

    statuses.push({
        id: newId,
        name: status_name,
        description: status_description,
        order: status_order ? Number(status_order) : newId
    });

    res.redirect("/statuses");
}

// get the edit page for one status
function getEditStatusForm(req, res){
    const status = statuses.find(s => s.id === Number(req.params.id));

    if (!status) {
        return res.status(404).send(`Status with id ${req.params.id} not found`);
    }

    res.send(`
        <h2>Edit status ${status.id}</h2>
        <form action="/status/edit/${status.id}" method="POST">
            <input name="status_name" value="${status.name}" required>
            <input name="status_description" value="${status.description}" required>
            <input name="status_order" type="number" value="${status.order}" required>
            <button>Update</button>
        </form>
    `);
}

// save the edit form for one status
function updateStatus(req, res){
    const status = statuses.find(s => s.id === Number(req.params.id));

    if (!status) {
        return res.status(404).send(`Status with id ${req.params.id} not found`);
    }

    const { status_name, status_description, status_order } = req.body;

    if (!status_name || !status_description) {
        return res.status(400).send("Missing required fields: status_name or status_description");
    }

    status.name = status_name;
    status.description = status_description;
    status.order = status_order ? Number(status_order) : status.order;

    res.redirect("/statuses");
}

// delete status by id
function deleteStatus(req, res){
    const index = statuses.findIndex(s => s.id === Number(req.params.id));

    if (index === -1) {
        return res.status(404).send(`Status with id ${req.params.id} not found`);
    }

    statuses.splice(index, 1);
    res.redirect("/statuses");
}

// get status by id
function getStatus(req, res){
    const status = statuses.find(s => s.id === Number(req.params.id));

    if (!status) {
        return res.status(404).send(`Status with id ${req.params.id} not found`);
    }

    res.send(`<h2>${status.name}</h2><p>${status.description}</p><p>Order: ${status.order}</p>`);
}

module.exports = {getAllStatuses,getNewStatusForm,createStatus,getEditStatusForm,updateStatus,deleteStatus,getStatus}

