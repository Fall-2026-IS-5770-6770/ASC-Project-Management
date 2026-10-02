const projectStatuses = require("../data/projectStatuses.js");
const projects = require("../data/projects.js");
const statuses = require("../data/statuses.js");

const data = projectStatuses.map((item) => {
  return {
    ...item,
    project: projects.find((project) => project.id === item.projectId),
    status: statuses.find((statuses) => statuses.id === item.statusId),
  };
});

// View all statuses used by a project
function getAll(req, res) {
  const record = { projectStatuses: data, projects, statuses, ...req.params };
  res.render("project-status/view-all.ejs", record);
}

// View single project-status association
function getSingle(req, res) {
  const record = data.find((item) => item.id.toString() === req.params.id);
  res.render("project-status/view.ejs", record);
}

// Form to update a project's status (e.g. its order in the workflow)
function getEdit(req, res) {
  const projectStatus = data.find(
    (item) => item.id.toString() === req.params.id,
  );
  const record = { projectStatus, statuses, projects };
  res.render("project-status/edit.ejs", record);
}

// Save a status added to a project
function postNew(req, res) {
  console.log(`Saved a new project status`);
  console.log(req.body);
  res.redirect("./all"); //redirect back to the home page
}

// Save the updated project status
function postEdit(req, res) {
  console.log(`Saved edits to status association ${req.params.id}`);
  console.log(req.body);
  res.redirect(`../${req.params.id}`); // Redirect to the view page after console logging the edit
}

// Remove a status from a project
function deleteSingle(req, res) {
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
