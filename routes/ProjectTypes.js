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

module.exports = router