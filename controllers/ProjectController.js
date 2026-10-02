// Get the create project page
function getCreatePage(req, res){
    res.send("Send the create project page");
}

// Save the new project from the create form
function saveNewProject(req, res){
    console.log(req.body);
    res.send("Save the new project");
}

// Get all projects
function getAllProjects(req, res){
    res.send("Send all of the projects");
}

// Get the edit page for one project
function getEditPage(req, res){
    res.send(`Send the edit page for project ${req.params.id}`);
}

// Save the edit form for one project
function saveProjectEdits(req, res){
    console.log(req.body);
    res.send(`Save the edits to project ${req.params.id}`);
}

// Delete one project by id
function deleteProject(req, res){
    res.send(`Delete project ${req.params.id}`);
}

// Get one project by id
function getProject(req, res){
    res.send(`Send project ${req.params.id}`);
}

module.exports = {getCreatePage,saveNewProject,getAllProjects,getEditPage,saveProjectEdits,deleteProject,getProject}
