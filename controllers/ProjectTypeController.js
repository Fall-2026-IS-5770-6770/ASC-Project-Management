const skills = require("../data/skills.js");
const projectTypes = require("./data/projectTypes.js");

// Get the create project type page
function getCreatePage(req, res){
    res.redirect("/project-types");
}

// Save the new project type from the create request
function saveNewProjectType(req, res){
    console.log("New project type saved:", req.body);
    res.redirect("/project-types");
}

// Get all project types
function getAllProjectTypes(req, res){
    res.render("project-types/index", { projectTypes });
}

// Get the edit page for one project type
function getEditPage(req, res){
    const projectType = projectTypes.find((t) => t.id === parseInt(req.params.id));
    if (!projectType) {
        return res.status(404).send("Project type not found");
    }
    res.render("project-types/edit", { projectType });
}

// Save the edit form for one project type
function saveProjectTypeEdits(req, res){
    console.log(`Edited project type ${req.params.id}:`, req.body);
    res.redirect("/project-types");
}

// Delete one project type by id
function deleteProjectType(req, res){
    console.log("Deleted project type:", req.params.id);
    res.redirect("/project-types");
}

// Get one project type by id
function getProjectType(req, res){
    const projectType = projectTypes.find((t) => t.id === parseInt(req.params.id));
    if (!projectType) {
        return res.status(404).send("Project type not found");
    }
    const skillNames = projectType.typicalSkillIds.map((id) => skills.find((skill) => skill.id === id).name);
    res.render("project-types/show", { projectType, skillNames });
}

module.exports = {getCreatePage,saveNewProjectType,getAllProjectTypes,getEditPage,saveProjectTypeEdits,deleteProjectType,getProjectType}
