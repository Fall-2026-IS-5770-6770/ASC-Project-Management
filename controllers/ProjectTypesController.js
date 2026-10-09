function getCreateProjectType(req, res){
    res.redirect("/");
};

function saveNewType(req, res){
    console.log("New project type saved:", req.body);
    res.redirect("/");
};

function getListTypes(req, res){
    res.render("/index", { projectTypes });
};

function getEditType(req, res){
    const projectType = projectTypes.find((t) => t.id === parseInt(req.params.id));
    if (!projectType) {
        return res.status(404).send("Project type not found");
    }
    res.render("/edit", { projectType });
};

function saveEditType(req, res){
    console.log(`Edited project type ${req.params.id}:`, req.body);
    res.redirect("/");
};

function saveDeleteType(req, res){
    console.log("Deleted project type:", req.params.id);
    res.redirect("/");
};

function getProjectType(req, res){
    const projectType = projectTypes.find((t) => t.id === parseInt(req.params.id));
    if (!projectType) {
        return res.status(404).send("Project type not found");
    }
    const skillNames = projectType.typicalSkillIds.map((id) => skills.find((skill) => skill.id === id).name);
    res.render("/show", { projectType, skillNames });
};

module.exports = {getCreateProjectType, saveNewType, getListTypes, getEditType, saveEditType, saveDeleteType, getProjectType}