const escapeHtml = require("ejs").escapeXML;

// GET /clients/all
function getViewAllClients(req, res) {
    res.send("Viewing all clients");
}

// GET /clients/new
function getClientPage(req,res){
    res.send("Send the new client page");
}

// POST /clients/new
function saveNewClient(req, res){
    console.log(req.body);
    res.render("Saving a new client");
}

// GET /clients/edit/:id
function editClient(req, res){
    res.type("text/plain").send(`Edit specific client ${escapeHtml(req.params.id)}`);
}

// POST /clients/edit/:id
function saveClientEdit(req, res){
    console.log(req.body);
    res.type("text/plain").send(`Saving edits to client ${escapeHtml(req.params.id)}`);
}

// POST /clients/delete/:id
function deleteClient(req, res){
    res.type("text/plain").send(`Deleting client ${escapeHtml(req.params.id)}`);
}

// GET /clients/:id
function viewSingleClient(req, res){
    res.type("text/plain").send(`Viewing a specific client ${escapeHtml(req.params.id)}`);
}

module.exports = { getViewAllClients, getClientPage, saveNewClient, editClient, saveClientEdit, deleteClient, viewSingleClient }