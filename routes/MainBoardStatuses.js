const express = require("express");

const router = express.Router();

const {
    getCreatePage,
    saveNewMainBoardStatus,
    getAllMainBoardStatuses,
    getEditPage,
    saveMainBoardStatusEdits,
    deleteMainBoardStatus
} = require("../controllers/MainBoardStatusController");

// Static paths (new, edit, delete) must be registered before /:id so they aren't shadowed.

// Get the create main board status page
router.get("/new", getCreatePage);

// Save the new main board status from the create form
router.post("/new", saveNewMainBoardStatus);

// Get all main board statuses
router.get("/", getAllMainBoardStatuses);

// Get the edit page for one main board status
router.get("/edit/:id", getEditPage);

// Save the edit form for one main board status
router.post("/edit/:id", saveMainBoardStatusEdits);

// Delete one main board status by id
router.post("/delete/:id", deleteMainBoardStatus);

module.exports = router;
