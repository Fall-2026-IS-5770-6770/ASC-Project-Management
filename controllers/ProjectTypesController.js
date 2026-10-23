const postgreSQL = require("../data-source");
const ProjectType = require("../entities/ProjectType");
const projectTypeRepository = postgreSQL.getRepository(ProjectType);

async function getCreateProjectType(req, res) {
    const projectTypes = await projectTypeRepository.find();
    res.render("createProjectType", { projectTypes });
};

async function saveNewType(req, res) {
    const projectType = new ProjectType();
    projectType.name = req.body.name;
    projectType.description = req.body.description;
    projectType.typicalSkillIds = req.body.typicalSkillIds;
    await projectTypeRepository.save(projectType);
    res.redirect("/");
};

async function getListTypes(req, res) {
    const projectTypes = await projectTypeRepository.find();
    res.render("/index", { projectTypes });
};

async function getEditType(req, res) {
    const projectType = await projectTypeRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!projectType) {
        return res.status(404).send("Project type not found");
    }
    res.render("/edit", { projectType });
};

async function saveEditType(req, res) {
    const projectType = await projectTypeRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!projectType) {
        return res.status(404).send("Project type not found");
    }
    projectType.name = req.body.name;
    projectType.description = req.body.description;
    projectType.typicalSkillIds = req.body.typicalSkillIds;
    await projectTypeRepository.save(projectType);
    res.redirect("/");
};

async function saveDeleteType(req, res) {
    const projectType = await projectTypeRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!projectType) {
        return res.status(404).send("Project type not found");
    }
    await projectTypeRepository.remove(projectType);
    res.redirect("/");
};

async function getProjectType(req, res) {
    const projectType = await projectTypeRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!projectType) {
        return res.status(404).send("Project type not found");
    }
    res.render("/show", { projectType });
};

module.exports = { getCreateProjectType, saveNewType, getListTypes, getEditType, saveEditType, saveDeleteType, getProjectType }