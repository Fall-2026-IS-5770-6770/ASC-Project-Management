// Project skill associations (Issue #29 pages, moved into a controller for Issue #67)
const projectSkills = require("../data/projectSkills");
const projects = require("../data/projects");
const skills = require("../data/skills.js");

// GET /project-skills
function getAllProjectSkills(req, res) {
    const enrichedProjectSkills = projectSkills.map(ps => {
        const project = projects.find(p => p.id === Number(ps.projectId));
        const skill = skills.find(s => s.id === Number(ps.skillId));
        return {
            ...ps,
            projectName: project ? project.name : "Unknown Project",
            skillName: skill ? skill.name : "Unknown Skill"
        };
    })
    .sort((a, b) => {
        // Primary sort: Compare Project IDs (Least to Greatest)
        if (a.projectId !== b.projectId) {
            return a.projectId - b.projectId;
        }
        // Secondary sort: If Project IDs are the same, compare Skill IDs (Least to Greatest)
        return a.skillId - b.skillId;
    });
    
    res.render("project-skills/index.ejs", { projectSkills: enrichedProjectSkills });
}

// GET /project-skills/new
function getCreateProjectSkillPage(req, res) {
    res.render("project-skills/create.ejs", { projects, skills })
}

// POST /project-skills
function saveNewProjectSkill(req, res) {
    console.log("Adding new project skill:", req.body);
    const nextProjectSkillId = projectSkills.length > 0 
        ? Math.max(...projectSkills.map(ps => ps.id)) + 1 
        : 1;
    const newProjectSkill = {
        id: nextProjectSkillId,
        projectId: Number(req.body.projectId),
        skillId: Number(req.body.skillId),
        importance: req.body.importance,
        minimumProficiency: req.body.minimumProficiency
    };

    projectSkills.push(newProjectSkill);
    res.redirect("/project-skills");
    res.redirect("/project-skills");
}

// GET /project-skills/:id
function getProjectSkill(req, res) {
    let ps = projectSkills.find(row => row.id === Number(req.params.id));
    ps["projectName"] = projects.find(row => row.id === Number(ps.projectId)).name
    ps["skillName"] = skills.find(row => row.id === Number(ps.skillId)).name
    if (!ps) return res.status(404).send("Not found");
    
    res.render("project-skills/show.ejs", { 
        projectSkill: ps
    });
}

// GET /project-skills/edit/:id
function getEditProjectSkillPage(req, res) {
    const ps = projectSkills.find(row => row.id === Number(req.params.id));
    if (!ps) return res.status(404).send("Not found");
    
    res.render("project-skills/edit.ejs", { 
        projectSkill: ps, 
        projects, 
        skills 
    });
}

// POST /project-skills/edit/:id
function updateProjectSkill(req, res) {
    console.log("Editing project skill", req.params.id, req.body);

    const idToEdit = Number(req.params.id);
    const skillIndex = projectSkills.findIndex(row => row.id === idToEdit);

    if (skillIndex !== -1) {
        // 2. Update its properties
        projectSkills[skillIndex].projectId = Number(req.body.projectId);
        projectSkills[skillIndex].skillId = Number(req.body.skillId);
        projectSkills[skillIndex].importance = req.body.importance;
        projectSkills[skillIndex].minimumProficiency = req.body.minimumProficiency;
    }

    res.redirect("/project-skills");
}

// POST /project-skills/delete/:id
function deleteProjectSkill(req, res) {
    console.log(`Deleting project skill ${req.params.id}`);
    const idToDelete = Number(req.params.id);

    const skillIndex = projectSkills.findIndex(row => row.id === idToDelete);

    if (skillIndex !== -1) {
        // 2. Use splice to remove 1 item at that index
        projectSkills.splice(skillIndex, 1);
    }

    res.redirect("/project-skills");
}

module.exports = { getAllProjectSkills, getCreateProjectSkillPage, saveNewProjectSkill, getProjectSkill, getEditProjectSkillPage, updateProjectSkill, deleteProjectSkill };
