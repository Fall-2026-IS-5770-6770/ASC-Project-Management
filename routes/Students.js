const express = require("express");

const router = express.Router();

const {getCreatePage,saveNewStudent,getAllStudents,getEditPage,saveStudentEdits,deleteStudent,getStudent} = require("../controllers/StudentController")

// Static paths (new, edit, delete) must be registered before /:id so they aren't shadowed.

// Get the create student page
router.get("/new", getCreatePage);

// Save the new student from the create form
router.post("/new", saveNewStudent);

// Get all students
router.get("/", getAllStudents);

// Get the edit page for one student
router.get("/edit/:id", getEditPage);

// Save the edit form for one student
router.post("/edit/:id", saveStudentEdits);

// Delete one student by id
router.post("/delete/:id", deleteStudent);

// Get one student by id
router.get("/:id", getStudent);


module.exports = router
