const express = require("express");

const router = express.Router();

const {getCreatePage,saveNewProjectType,getAllProjectTypes,getEditPage,saveProjectTypeEdits,deleteProjectType,getProjectType} = require("../controllers/ProjectTypeController")

// Static paths (new, edit, delete) must be registered before /:id so they aren't shadowed.

// Get the create project page
router.get("/new", getCreatePage);

// Save the new project from the create form
router.post("/new", saveNewProjectType);

// Get all projects
router.get("/", getAllProjectTypes);

// Get the edit page for one project
router.get("/edit/:id", getEditPage);

// Save the edit form for one project
router.post("/edit/:id", saveProjectTypeEdits);

// Delete one project by id
router.post("/delete/:id", deleteProjectType);

// Get one project by id
router.get("/:id", getProjectType);


module.exports = router