// ===== PROJECT PEOPLE Router (Issue #12) =====
// Associates people (mentors and students) with a specific project

const express = require("express");
const router = express.Router();

// import functions from People-ProjectsController.js
const {getPeopleProjectViewAllPage, 
    getNewPeopleProject,
    saveNewPeopleProject, 
    editPeopleProject,
    saveEditedPeopleProject,
    deletePeopleProject,
    viewSpecificPeopleProject} = require("../controllers/People-ProjectsController")

// View all people associated with a project
router.get("/", getPeopleProjectViewAllPage);

// Form to create a relationship
router.get("/new", getNewPeopleProject);

// Save new relationship
router.post("/new", saveNewPeopleProject);

// Form to edit a relationship
router.get("/edit/:id", editPeopleProject);

// Save edited relationship
router.post("/edit/:id", saveEditedPeopleProject);

// Delete a relationship
router.post("/delete/:id", deletePeopleProject);

// View a specific relationship
router.get("/:id", viewSpecificPeopleProject);

// export entire thing as a router to main index.js
module.exports = router;