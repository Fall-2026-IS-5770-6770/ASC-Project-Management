// Get the create requirement page
function getCreatePage(req, res){
    res.send("Create requirements page");
}

// Save the new requirement from the create request
function saveNewRequirement(req, res){
    res.send("New requirement saved");
}

// Get all requirements
function getAllRequirements(req, res){
    res.send("All requirements page");
}

// Get the edit page for one requirement
function getEditPage(req, res){
    res.send(`Edit requirement page for ID: ${req.params.id}`);
}

// Save the edit form for one requirement
function saveRequirementEdits(req, res){
    res.send(`Edits saved for requirement ${req.params.id}`);
}

// Delete one requirement by id
function deleteRequirement(req, res){
    res.send(`Requirement ${req.params.id} deleted`);
}

// Get one requirement by id
function getRequirement(req, res){
    res.send(`View requirement page for ID: ${req.params.id}`);
}

module.exports = {getCreatePage,saveNewRequirement,getAllRequirements,getEditPage,saveRequirementEdits,deleteRequirement,getRequirement}
