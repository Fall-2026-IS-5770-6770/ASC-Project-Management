const mainBoardStatuses = require("../data/mainBoardStatuses.js");

// Get the create main board status page
function getCreatePage(req, res) {
    res.redirect("/main-board/statuses");
}

// Save the new main board status from the create request
function saveNewMainBoardStatus(req, res) {
    console.log("Main board status create request:", req.body);
    res.redirect("/main-board/statuses");
}

// Get all main board statuses
function getAllMainBoardStatuses(req, res) {
    const orderedStatuses = [...mainBoardStatuses].sort((firstStatus, secondStatus) => firstStatus.order - secondStatus.order);
    res.render("main-board-statuses/index", { statuses: orderedStatuses });
}

// Get the edit page for one main board status
function getEditPage(req, res) {
    const statusId = Number(req.params.id);
    const status = mainBoardStatuses.find(mainBoardStatus => mainBoardStatus.id === statusId);

    if (!status) {
        return res.status(404).type("text/plain").send(`Main board status with id ${statusId} not found`);
    }

    res.render("main-board-statuses/edit", { status });
}

// Save the edit form for one main board status
function saveMainBoardStatusEdits(req, res) {
    console.log("Main board status edit request for", req.params.id, req.body);
    res.redirect("/main-board/statuses");
}

// Delete one main board status by id
function deleteMainBoardStatus(req, res) {
    console.log("Main board status delete request for", req.params.id);
    res.redirect("/main-board/statuses");
}

module.exports = {
    getCreatePage,
    saveNewMainBoardStatus,
    getAllMainBoardStatuses,
    getEditPage,
    saveMainBoardStatusEdits,
    deleteMainBoardStatus
};
