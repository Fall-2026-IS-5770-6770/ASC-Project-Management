const express = require("express");

const router = express.Router();

const {getCreatePage,saveNewSkill,getAllSkills,getEditPage,saveSkillEdits,deleteSkill,getSkill} = require("../controllers/SkillController")

// Static paths (new, edit, delete) must be registered before /:id so they aren't shadowed.

// Get the create skill page
router.get("/new", getCreatePage);

// Save the new skill from the create form
router.post("/new", saveNewSkill);

// Get all skills
router.get("/", getAllSkills);

// Get the edit page for one skill
router.get("/edit/:id", getEditPage);

// Save the edit form for one skill
router.post("/edit/:id", saveSkillEdits);

// Delete one skill by id
router.post("/delete/:id", deleteSkill);

// Get one skill by id
router.get("/:id", getSkill);


module.exports = router