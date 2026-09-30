function getAllProjectSkills(req, res) {
    res.send("Send all existing project skills");
}

function getCreateProjectSkillPage(req, res) {
    res.send("Send page for creating a new project skill");
}

function saveNewProjectSkill(req, res) {
    console.log(req.body);
    res.send("Save the new project skill");
}

function getProjectSkill(req, res) {
    res.send(`Send project skill ${req.params.id}`);
}

function getEditProjectSkillPage(req, res) {
    res.send(`Send the edit page for project skill ${req.params.id}`);
}

function updateProjectSkill(req, res) {
    console.log(req.body);
    res.send(`Save updates to project skill ${req.params.id}`);
}

function deleteProjectSkill(req, res) {
    res.send(`Delete project skill ${req.params.id}`)
}

module.exports = {getAllProjectSkills,getCreateProjectSkillPage,saveNewProjectSkill,getEditProjectSkillPage,updateProjectSkill,deleteProjectSkill,getProjectSkill}