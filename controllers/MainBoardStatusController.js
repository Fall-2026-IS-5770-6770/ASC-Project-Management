const mainBoardStatuses = require("../data/mainBoardStatuses.js");
const mainBoardStatusTable = require("../entities/mainBoardStatus.entities.js");

const postgres = require("../app-data-source.js");
const mainBoardStatusRepo = postgres.manager.getRepository(mainBoardStatusTable);

function applyFormFields(status, body) {
  status.name = body.name;
  status.description = body.description;
 
  // project is required (nullable: false), so a new status must get one.
  // On edit, the project only changes if the form sends a projectId.
  if (body.projectId) {
    status.project = { id: Number(body.projectId) };
  }
}


// Get all main board statuses
async function getAllMainBoardStatuses(req, res, next) {
  try {
    const statuses = await statusRepo.find({ order: { order: "ASC" } });
    res.render("main-board-statuses/statuses", { statuses, notice: req.query.notice });
  } catch (err) {
    next(err);
  }
}


// Get the create main board status page
function getCreatePage(req, res) {
    res.redirect("/main-board-statuses/new");
}

// Save the new main board status from the create request
async function saveNewMainBoardStatus(req, res, next) {
  try {
    const status = statusRepo.create();
    applyFormFields(status, req.body);
    await statusRepo.save(status);
    res.redirect("/main-board-statuses?notice=created");
  } catch (err) {
    next(err);
  }
}


// Get the edit page for one main board status
async function getEditPage(req, res, next) {
  try {
    const statusId = Number(req.params.id);
    const status = await statusRepo.findOneBy({ id: statusId });
 
    if (!status) {
      return res.status(404).type("text/plain").send(`Main board status with id ${statusId} not found`);
    }
 
    // View name is a file path, not the URL
    res.render("main-board-statuses/edit", { status });
  } catch (err) {
    next(err);
  }
}

// Save the edit form for one main board status
async function saveMainBoardStatusEdits(req, res, next) {
  try {
    const statusId = Number(req.params.id);
    const status = await statusRepo.findOneBy({ id: statusId });
 
    if (!status) {
      return res.status(404).type("text/plain").send(`Main board status with id ${statusId} not found`);
    }
 
    applyFormFields(status, req.body);
    await statusRepo.save(status);
    res.redirect(`/main-board-statuses/${statusId}?notice=updated`);
  } catch (err) {
    next(err);
  }
}

// Delete one main board status by id
async function deleteMainBoardStatus(req, res, next) {
  try {
    const statusId = Number(req.params.id);
    const status = await statusRepo.findOneBy({ id: statusId });
 
    if (status) {
      await statusRepo.remove(status);
    }
    res.redirect("/main-board-statuses?notice=deleted");
  } catch (err) {
    next(err);
  }
}

module.exports = {
    getCreatePage,
    saveNewMainBoardStatus,
    getAllMainBoardStatuses,
    getEditPage,
    saveMainBoardStatusEdits,
    deleteMainBoardStatus
};
