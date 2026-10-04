const mainBoardStatuses = require("../data/mainBoardStatuses.js");

// Get the create main board status page
function getCreatePage(req, res) {
    res.redirect("/main-board/statuses");
}

// Save the new main board status from the create request
function saveNewMainBoardStatus(req, res) {
    console.log("Main board status create request:", req.body);
}

// Get all main board statuses
function getAllMainBoardStatuses(req, res) {
    res.send("All Main Board Statuses");
}

// Get the edit page for one main board status
function getEditPage(req, res) {
    res.send(`Send the edit page for project ${req.params.id}`);
}

// Save the edit form for one main board status
function saveMainBoardStatusEdits(req, res) {
    console.log(`Main board status edit request for ${req.params.id}:`, req.body);
}

// Delete one main board status by id
function deleteMainBoardStatus(req, res) {
    console.log(`Main board status delete request for ${req.params.id}`);
}

module.exports = {
    getCreatePage,
    saveNewMainBoardStatus,
    getAllMainBoardStatuses,
    getEditPage,
    saveMainBoardStatusEdits,
    deleteMainBoardStatus
};
