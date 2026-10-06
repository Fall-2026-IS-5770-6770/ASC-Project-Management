// controller for the route for people-projects relationships
const escapeHtml = require("ejs").escapeXML;

function getPeopleProjectViewAllPage(req, res){
    res.type("text/plain").send(`Show all people associated with project ${escapeHtml(req.params.projectid)}`);
}

function getNewPeopleProject(req, res){
    res.type("text/plain").send(`Show the form for adding a person to project ${escapeHtml(req.params.projectid)}`);
}

function saveNewPeopleProject(req, res){
    console.log(req.body);
    res.type("text/plain").send(`Saved a new relationship between a person and project ${escapeHtml(req.params.projectid)}`);
}

function editPeopleProject(req, res){
    res.type("text/plain").send(`Show the form for editing relationship ${escapeHtml(req.params.id)} on project ${escapeHtml(req.params.projectid)}`);
}

function saveEditedPeopleProject(req, res){
    console.log(req.body);
    res.type("text/plain").send(`Saved edits to relationship ${escapeHtml(req.params.id)} on project ${escapeHtml(req.params.projectid)}`);
}

function deletePeopleProject(req, res){
    res.type("text/plain").send(`Deleted relationship ${escapeHtml(req.params.id)} from project ${escapeHtml(req.params.projectid)}`);
}

function viewSpecificPeopleProject(req, res){
    res.type("text/plain").send(`Show relationship ${escapeHtml(req.params.id)} between a person and project ${escapeHtml(req.params.projectid)}`);
}


// export every individual function 
module.exports = {
    getPeopleProjectViewAllPage, 
    getNewPeopleProject,
    saveNewPeopleProject, 
    editPeopleProject,
    saveEditedPeopleProject,
    deletePeopleProject,
    viewSpecificPeopleProject
}