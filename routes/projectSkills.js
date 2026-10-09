const express = require("express");

const router = express.Router();

const {getAllProjectSkills,getCreateProjectSkillPage,saveNewProjectSkill,getEditProjectSkillPage,updateProjectSkill,deleteProjectSkill,getProjectSkill} = require('../controllers/projectSkillsController');

router.get("/", getAllProjectSkills);

router.get("/new", getCreateProjectSkillPage);

router.post("/", saveNewProjectSkill);

router.get("/:id", getProjectSkill);

router.get("/edit/:id", getEditProjectSkillPage);

router.post("/edit/:id", updateProjectSkill);

router.post("/delete/:id", deleteProjectSkill);

module.exports = router