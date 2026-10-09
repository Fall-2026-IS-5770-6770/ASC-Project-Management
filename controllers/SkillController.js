// Skills (Issue #28 pages, moved into a controller for Issue #66)
const skills = require("../data/skills.js");

// GET /skills/new
function getCreatePage(req,res) {
    res.render("skills/index.ejs", {mode: "new"});
    //res.send("Send the create skill page");
}

// POST /skills/new
function saveNewSkill(req,res) {
    //res.send("Save the new skill");
    res.redirect("/skills");
}

// GET /skills
function getAllSkills(req,res) {
    res.render("skills/index.ejs", {mode: "list", skills });
}

// GET /skills/:id/edit
function getEditPage(req,res) {
    const skill = skills.find((s) => s.id === Number(req.params.id));
    if (!skill) return res.status(404).send("Skill not found");
    res.render("skills/index.ejs", {mode: "edit", skill });
}

// POST /skills/:id/edit
function saveSkillEdits(req,res) {
    //res.send(`Save the edits to skill ${req.params.id}`);
    res.redirect(`/skills/${req.params.id}`);
}

// POST /skills/:id/delete
function deleteSkill(req,res) {
    //res.send(`Delete skill ${req.params.id}`);
    res.redirect("/skills")
}

// GET /skills/:id
function getSkill(req,res) {
    const skill = skills.find((s) => s.id === Number(req.params.id));
    if (!skill) return res.status(404).send("Skill not found");
    res.render("skills/index.ejs", {mode: "show", skill });
}

module.exports = { getCreatePage, saveNewSkill, getAllSkills, getEditPage, saveSkillEdits, deleteSkill, getSkill };
