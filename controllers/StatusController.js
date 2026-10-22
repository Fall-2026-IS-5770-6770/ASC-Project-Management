const postgres = requires("../app-data-source");
const statusTable = require("../entities/Status.entities.js");

const statusRepo = postgres.manager.getRepository(statusTable);

// GET /status
const index = async (req, res) => {
  const status = await statusRepo.find();
  res.render("StatusController/index", { title: "status", status, notice: req.query.notice });
};

// GET /status/new
const newStatus = (req, res) => {
  res.render("StatusController/newStatus", { title: "Add Status" });
};

// POST /status
const createStatus = async(req, res) => {
  // TODO: create a status from req.body
  const newStatus = statusRepo.create()
  newStatus.name = req.body.name;
  newStatus.description = req.body.description;
  await statusRepo.save(newStatus)
  res.redirect("/status?notice=created");
};

// GET /status/:id
const showStatus = (req, res) => {
  // TODO: load status by req.params.id
  const status = null;
  res.render("StatusController/showStatus", { title: "Status Info", id: req.params.id, status, notice: req.query.notice });
};

// GET /status/:id/edit
const editStatus = (req, res) => {
  // TODO: load status by req.params.id
  const status = null;
  res.render("StatusController/editStatus", { title: "Edit Status", id: req.params.id, status });
};

// POST /status/:id/edit
const updateStatus = async(req, res) => {
  // TODO: update status req.params.id with req.body
  const status = await statusRepo.findOneBy({id:req.params.id})
  status.name = req.body.name;
  status.description = req.body.description;
  await statusRepo.save(status)
  res.redirect(`/StatusController/${req.params.id}?notice=updated`);
};

// POST /status/:id/delete
const destroyStatus = async(req, res) => {
  // TODO: delete status req.params.id
  const status = await statusRepo.findOneBy({id:req.params.id})
  await statusRepo.remove(status)
  res.redirect("/status?notice=deleted");
};

module.exports = { index, newStatus, createStatus, showStatus, editStatus, updateStatus, destroyStatus }

