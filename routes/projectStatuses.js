const express = require("express");
const router = express.Router()
const projectStatuses = require("../data/projectStatuses.js");
const projects = require("../data/projects.js");
const statuses = require("../data/statuses.js");

const data = projectStatuses.map((item) => {
    return {
        ...item,
        project: projects.find((project)=>project.id===item.projectId),
        status: statuses.find((statuses)=>statuses.id===item.statusId),
    }
});


// View all statuses used by a project
router.get("/all", (req, res) => {
    const record = {projectStatuses: data, projects, statuses, ...req.params};
    res.render("project-status/view-all.ejs", record);
});

router.get("/:id", (req, res) => {
    const record = data.find((item) => item.id.toString() === req.params.id);
    res.render("project-status/view.ejs", record);
});

// Form to add a status to a project
// Task indicates that the create should be handled within a modal, so I wrapped this into the /all page
// router.get("/new", (req, res) => {
//     res.send(`Saved a new project status`);
// });

// Save a status added to a project
router.post("/new", (req, res) => {
    console.log(`Saved a new project status`);
    console.log(req.body);
    res.redirect("./all"); //redirect back to the home page 
});

// Form to update a project's status (e.g. its order in the workflow)
router.get("/edit/:id", (req, res) => {
    const projectStatus = data.find((item) => item.id.toString() === req.params.id);
    const record = {projectStatus, statuses, projects};
    res.render("project-status/edit.ejs", record);
});

// Save the updated project status
router.post("/edit/:id", (req, res) => {
    console.log(`Saved edits to status association ${req.params.id}`);
    console.log(req.body);
    res.redirect(`../${req.params.id}`); // Redirect to the view page after console logging the edit
});

// Remove a status from a project
router.post("/delete/:id", (req, res) => {
    console.log(`Removed project status association ${req.params.id}`);
    res.redirect("../all"); // Redirect to the all page after console logging the delete
});

module.exports = router;
