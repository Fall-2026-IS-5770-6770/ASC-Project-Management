const postgres = require("../app-data-source");
const SkillTable = require("../entities/Skill.entities")

const skillRepo = postgres.manager.getRepository(SkillTable)

// GET /skills
const index = async (req, res) => {
    const skill = await skillRepo.find()
    res.render("Skill/index", { title: "skill", skill, notice:req.query.notice});
}

// GET /skills/new
const newForm = (req, res) => {
    res.render("Skill/new", { title: "Add Skill"});
}

// POST /skills
const create = async (req, res) => {
    const newSkill = await skillRepo.create();
    newSkill.skillName = req.body.skillName;
    newSkill.category = req.body.category;
    newSkill.description = req.body.description;
    await skillRepo.save(newSkill);
    res.redirect("/skills?notice=created");
}

//GET /skill/:id
const show = (req, res) => {
    const skill = null;
    res.render("Skill/edit", {title: "Edit Skill", id:req.params.id, skill});
}

//GET /skill/:id/edit
const editForm = (req, res) => {
    const skill = null;
    res.render("Skill/edit", {title: "Edit Skill", id: req.params.id, skill})
}

//POST /skill/:id/edit
const update = async (req, res) => {
    const skill = await skillRepo.findOneBy({id:req.params.id})
    skill.skillName = req.body.skillName;
    skill.category = req.body.category;
    skill.description = req.body.description;
    await skillRepo.save(skill);
    res.redirect(`/skill/${req.params.id}?notice-updated`);
};

//POST /skill/:id/delete
const destroy = async (req, res) => {
    const skill = await skillRepo.findOneBy({id:req.params.id})
    skill.skillName = req.body.skillName;
    skill.category = req.body.category;
    skill.description = req.body.description;
    await skillRepo.remove(skill);
    res.redirect("/people?notice=deleted");
};

module.exports = {index, newForm, create, show, editForm, update, destroy}