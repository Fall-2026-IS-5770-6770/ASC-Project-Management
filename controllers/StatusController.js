
const statuses = require("../data/statuses.js");

// all statuses
function getAllStatuses(req, res){
    res.render("statuses/index", { statuses, title: "Statuses", activePage: "Statuses" });
}

// create status page
function getNewStatusForm(req, res){
    res.render("statuses/new", { title: "Statuses", activePage: "Statuses" });
}

// save the new status 
function createStatus(req, res){
    const { status_name, status_description, status_order } = req.body;

    if (!status_name || !status_description) {
        return res.status(400).type("text/plain").send("Missing required fields: status_name or status_description");
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
        return res.status(404).type("text/plain").send(`Status with id ${req.params.id} not found`);
    }

    res.render("statuses/edit", { status, title: "Statuses", activePage: "Statuses" });
}

// save the edit form for one status
function updateStatus(req, res){
    const status = statuses.find(s => s.id === Number(req.params.id));

    if (!status) {
        return res.status(404).type("text/plain").send(`Status with id ${req.params.id} not found`);
    }

    const { status_name, status_description, status_order } = req.body;

    if (!status_name || !status_description) {
        return res.status(400).type("text/plain").send("Missing required fields: status_name or status_description");
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
        return res.status(404).type("text/plain").send(`Status with id ${req.params.id} not found`);
    }

    statuses.splice(index, 1);
    res.redirect("/statuses");
}

// get status by id
function getStatus(req, res){
    const status = statuses.find(s => s.id === Number(req.params.id));

    if (!status) {
        return res.status(404).type("text/plain").send(`Status with id ${req.params.id} not found`);
    }

    res.render("statuses/show", { status, title: "Statuses", activePage: "Statuses" });
}

module.exports = {getAllStatuses,getNewStatusForm,createStatus,getEditStatusForm,updateStatus,deleteStatus,getStatus}

