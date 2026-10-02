const express = require("express");

const router = express.Router();

const {getCreatePage,saveNewProject,getAllProjects,getEditPage,saveProjectEdits,deleteProject,getProject} = require("../controllers/ProjectController")

// Static paths (new, edit, delete) must be registered before /:id so they aren't shadowed.

// Get the create project page
router.get("/new", getCreatePage);

// Save the new project from the create form
router.post("/new", saveNewProject);

// Get all projects
router.get("/", getAllProjects);

// Get the edit page for one project
router.get("/edit/:id", getEditPage);

// Save the edit form for one project
router.post("/edit/:id", saveProjectEdits);

// Delete one project by id
router.post("/delete/:id", deleteProject);

// Get one project by id
router.get("/:id", getProject);


module.exports = router
