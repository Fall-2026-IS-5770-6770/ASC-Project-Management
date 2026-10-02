// Get the create skill page
function getCreatePage(req, res){
    res.send("Send the create skill page");
}

// Save the new skill from the create form
function saveNewSkill(req, res){
    console.log(req.body);
    res.send("Save the new skill");
}

// Get all skills
function getAllSkills(req, res){
    res.send("Send all of the skills");
}

// Get the edit page for one skill
function getEditPage(req, res){
    res.send(`Send the edit page for skill ${req.params.id}`);
}

// Save the edit form for one skill
function saveSkillEdits(req, res){
    console.log(req.body);
    res.send(`Save the edits to skill ${req.params.id}`);
}

// Delete one skill by id
function deleteSkill(req, res){
    res.send(`Delete skill ${req.params.id}`);
}

// Get one skill by id
function getSkill(req, res){
    res.send(`Send skill ${req.params.id}`);
}

module.exports = {getCreatePage,saveNewSkill,getAllSkills,getEditPage,saveSkillEdits,deleteSkill,getSkill}