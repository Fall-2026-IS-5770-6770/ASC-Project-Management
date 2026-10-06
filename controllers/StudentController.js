const students = require("../data/students.js");
const people = require("../data/people.js");
const projectTypes = require("../data/projectTypes.js");
const skills = require("../data/skills.js");
const escapeHtml = require("ejs").escapeXML;


// This Logic is for the StudentController, which handles the routes for students. It includes functions to get the create page, save a new student, get all students, get the edit page for a student, save edits to a student, delete a student, and get a single student by id. The controller also includes helper functions to attach the matching person to a student and to provide data needed for the student form options.
// A student row has no name on it; it points at a person by personId.

const studentApprovalStatuses = ["Approved", "Pending", "Not Approved"];

// Attach the matching person so views can show the student's name and contact info
const withPerson = (student) => ({
    ...student,
    person: people.find((p) => p.id === student.personId)
});

// Data every page with the student form needs (create modal and edit page)
const studentFormOptions = () => ({
    projectTypes,
    skills,
    approvalStatuses: studentApprovalStatuses,
    // Only people who are not already students can be made into one
    availablePeople: people.filter((person) => !students.some((s) => s.personId === person.id))
});

const renderStudentList = (res, openCreateModal) => {
    res.render("students/index", {
        title: "Students",
        activePage: "Students",
        students: students.map(withPerson),
        openCreateModal,
        ...studentFormOptions()
    });
};

// Get the create student page
// Create is a modal on the list page, so /students/new opens the list with the modal showing
function getCreatePage(req, res){
    renderStudentList(res, true);
}

// Save the new student from the create form
function saveNewStudent(req, res){
    const personId = Number(req.body.personId);

    if (!people.some((p) => p.id === personId)) {
        return res.status(400).type("text/plain").send(`Person with id ${escapeHtml(personId)} not found`);
    }
    if (students.some((s) => s.personId === personId)) {
        return res.status(400).type("text/plain").send(`Person with id ${escapeHtml(personId)} is already a student`);
    }

    // Use the highest existing id so ids stay unique after deletes
    const newStudentId = students.reduce((max, s) => Math.max(max, s.id), 0) + 1;

    students.push({
        id: newStudentId,
        personId,
        major: req.body.major,
        graduationDate: req.body.graduationDate,
        resumeUrl: req.body.resumeUrl,
        minHoursPerWeek: Number(req.body.minHoursPerWeek),
        maxHoursPerWeek: Number(req.body.maxHoursPerWeek),
        workApprovalStatus: req.body.workApprovalStatus,
        availability: req.body.availability,
        preferredProjectTypeId: req.body.preferredProjectTypeId ? Number(req.body.preferredProjectTypeId) : null,
        // One checked box comes through as a string, several as an array
        skillIds: [].concat(req.body.skillIds ?? []).map(Number)
    });

    res.redirect("/students");
}

// Get all students
function getAllStudents(req, res){
    renderStudentList(res, false);
}

// Get the edit page for one student
function getEditPage(req, res){
    const student = students.find((s) => s.id === Number(req.params.id));

    if (!student) {
        return res.status(404).type("text/plain").send(`Student with id ${escapeHtml(req.params.id)} not found`);
    }

    res.render("students/edit", {
        title: "Edit Student",
        activePage: "Students",
        student: withPerson(student),
        ...studentFormOptions()
    });
}

// Save the edit form for one student
// The data file is not updated yet; logging proves the edit form reached this route
function saveStudentEdits(req, res){
    console.log(`Edit submitted for student ${req.params.id}: major = ${req.body.major}`);
    res.redirect(`/students/${req.params.id}`);
}

// Delete one student by id
// Removes only the student record; the underlying person is kept
function deleteStudent(req, res){
    const studentIndex = students.findIndex((s) => s.id === Number(req.params.id));

    if (studentIndex === -1) {
        return res.status(404).type("text/plain").send(`Student with id ${escapeHtml(req.params.id)} not found`);
    }

    students.splice(studentIndex, 1);
    res.redirect("/students");
}

// Get one student by id
function getStudent(req, res){
    const student = students.find((s) => s.id === Number(req.params.id));

    if (!student) {
        return res.status(404).type("text/plain").send(`Student with id ${escapeHtml(req.params.id)} not found`);
    }

    res.render("students/show", {
        title: "Student",
        activePage: "Students",
        student: withPerson(student),
        preferredProjectType: projectTypes.find((type) => type.id === student.preferredProjectTypeId),
        studentSkills: skills.filter((skill) => student.skillIds.includes(skill.id))
    });
}

module.exports = {getCreatePage,saveNewStudent,getAllStudents,getEditPage,saveStudentEdits,deleteStudent,getStudent}
