// controller for the route for people-projects relationships

function getPeopleProjectViewAllPage(req, res){
    res.send(`Show all people associated with project ${req.params.projectid}`);
}

function getNewPeopleProject(req, res){
    res.send(`Show the form for adding a person to project ${req.params.projectid}`);
}

function saveNewPeopleProject(req, res){
    console.log(req.body);
    res.send(`Saved a new relationship between a person and project ${req.params.projectid}`);
}

function editPeopleProject(req, res){
    res.send(`Show the form for editing relationship ${req.params.id} on project ${req.params.projectid}`);
}

function saveEditedPeopleProject(req, res){
    console.log(req.body);
    res.send(`Saved edits to relationship ${req.params.id} on project ${req.params.projectid}`);
}

function deletePeopleProject(req, res){
    res.send(`Deleted relationship ${req.params.id} from project ${req.params.projectid}`);
}

function viewSpecificPeopleProject(req, res){
    res.send(`Show relationship ${req.params.id} between a person and project ${req.params.projectid}`);
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