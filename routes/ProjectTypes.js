const express = require("express");

const router = express.Router();

const {getCreateProjectType,saveNewType,getListTypes,getEditType,saveEditType,saveDeleteType,getProjectType} = require("../controllers/ProjectTypesController.js")

// Create lives in a modal on the list page, so this route just sends you there
router.get("/new", getCreateProjectType);

// Save the new project type
router.post("/new", saveNewType);

// List every project type
router.get("/", getListTypes);

// Show the edit form for one project type
router.get("/edit/:id", getEditType);

// Save the edit form
router.post("/edit/:id", saveEditType);

// Delete one project type
router.post("/delete/:id", saveDeleteType);

// Show one project type
router.get("/:id", getProjectType);

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