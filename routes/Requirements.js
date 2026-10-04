const express = require("express");

const router = express.Router();

const {getCreatePage,saveNewRequirement,getAllRequirements,getEditPage,saveRequirementEdits,deleteRequirement,getRequirement} = require("../controllers/RequirementController")

// Static paths (new, edit, delete) must be registered before /:id so they aren't shadowed.

// Get the create requirement page
router.get("/new", getCreatePage);

// Save the new requirement from the create form
router.post("/new", saveNewRequirement);

// Get all requirements
router.get("/", getAllRequirements);

// Get the edit page for one requirement
router.get("/edit/:id", getEditPage);

// Save the edit form for one requirement
router.post("/edit/:id", saveRequirementEdits);

// Delete one requirement by id
router.post("/delete/:id", deleteRequirement);

// Get one requirement by id
router.get("/:id", getRequirement);


module.exports = router