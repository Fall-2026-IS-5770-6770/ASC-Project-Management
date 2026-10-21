const postgres = require("../data-source");
const ProjectStatus = require("../entities/ProjectStatus.entities");

// Leaving these for the getAll controller. Will need to update when project and status entities are implemented
const projects = require("../data/projects.js");
const statuses = require("../data/statuses.js");

const repo = postgres.getRepository(ProjectStatus);

// View all statuses used by a project
async function getAll(req, res) {
  const data = await repo.find();
  const record = { projectStatuses: data, projects, statuses, ...req.params };
  res.render("project-status/view-all.ejs", record);
}

// View single project-status association
async function getSingle(req, res) {
  const record = await repo.findOneBy({
    id: req.params.id,
  });
  res.render("project-status/view.ejs", record);
}

// Form to update a project's status (e.g. its order in the workflow)
async function getEdit(req, res) {
  const projectStatus = await repo.findOneBy({
    id: req.params.id,
  });
  const record = { projectStatus, statuses, projects };
  res.render("project-status/edit.ejs", record);
}

// Save a status added to a project
async function postNew(req, res) {
  const newProjectStatus = repo.create();
  newProjectStatus.order = req.body.order;
  newProjectStatus.projectId = req.body.projectId;
  newProjectStatus.statusId = req.body.statusId;
  await repo.save(newProjectStatus);
  res.redirect("./all"); //redirect back to the home page
}

// Save the updated project status
async function postEdit(req, res) {
  const projectStatus = repo.findOneBy({ id: req.params.id });
  projectStatus.order = req.body.order;
  projectStatus.projectId = req.body.projectId;
  projectStatus.statusId = req.body.statusId;
  await repo.save(projectStatus);
  res.redirect(`../${req.params.id}`); // Redirect to the view page after console logging the edit
}

// Remove a status from a project
async function deleteSingle(req, res) {
  const projectStatus = repo.findOneBy({ id: req.params.id });
  await repo.remove(projectStatus);
  console.log(`Removed project status association ${req.params.id}`);
  res.redirect("../all"); // Redirect to the all page after console logging the delete
}

module.exports = {
  getAll,
  getSingle,
  getEdit,
  postNew,
  postEdit,
  deleteSingle,
};
