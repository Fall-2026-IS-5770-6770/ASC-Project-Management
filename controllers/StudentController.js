const {In} = require("typeorm");
const postgres = require("../app-data-source.js");
const StudentTable = require("../entities/Student.entities.js");
const escapeHtml = require("ejs").escapeXML;

const studentRepo = postgres.getRepository(StudentTable);
const personRepo = postgres.getRepository("Person");
const projectTypeRepo = postgres.getRepository("ProjectType");
const skillRepo = postgres.getRepository("Skill");


// This Logic is for the StudentController, which handles the routes for students. It includes functions to get the create page, save a new student, get all students, get the edit page for a student, save edits to a student, delete a student, and get a single student by id. The controller also includes helper functions to shape a student for the views and to provide data needed for the student form options.
// A student row has no name on it; it points at a person through the person relation.

const studentApprovalStatuses = ["Approved", "Pending", "Not Approved"];

// The views read personId, preferredProjectTypeId, and skillIds, so flatten the relations into those
const toView = (student) => ({
    ...student,
    personId: student.person?.id,
    preferredProjectTypeId: student.preferredProjectType?.id ?? null,
    skillIds: (student.skills || []).map((skill) => skill.id)
});

// The views show skill.name; the Skill entity stores it as skillName
const withSkillName = (skill) => ({...skill, name: skill.name ?? skill.skillName});

// Ids are bigint, so anything that isn't digits can't match a row (and would make Postgres error)
const findStudent = (id, relations = {}) => {
    if (!/^\d+$/.test(id)) return null;
    return studentRepo.findOne({where: {id}, relations});
};

const sendNotFound = (res, id) =>
    res.status(404).type("text/plain").send(`Student with id ${escapeHtml(id)} not found`);

// Data every page with the student form needs (create modal and edit page)
const studentFormOptions = async () => {
    const [students, people, projectTypes, skills] = await Promise.all([
        studentRepo.find(),
        personRepo.find(),
        projectTypeRepo.find(),
        skillRepo.find()
    ]);

    return {
        projectTypes,
        skills: skills.map(withSkillName),
        approvalStatuses: studentApprovalStatuses,
        // Only people who are not already students can be made into one
        availablePeople: people.filter((person) => !students.some((s) => s.person?.id === person.id))
    };
};

// Copy the student fields from the create/edit form onto a student entity
const applyForm = async (student, body) => {
    student.major = body.major;
    student.graduationDate = body.graduationDate || null;
    student.resumeUrl = body.resumeUrl || null;
    student.minHoursPerWeek = Number(body.minHoursPerWeek);
    student.maxHoursPerWeek = Number(body.maxHoursPerWeek);
    student.workApprovalStatus = body.workApprovalStatus;
    student.availability = body.availability || null;
    student.preferredProjectType = body.preferredProjectTypeId ? {id: Number(body.preferredProjectTypeId)} : null;

    // One checked box comes through as a string, several as an array
    const skillIds = [].concat(body.skillIds ?? []);
    student.skills = skillIds.length ? await skillRepo.findBy({id: In(skillIds)}) : [];
};

const renderStudentList = async (res, openCreateModal) => {
    const students = await studentRepo.find({order: {id: "ASC"}});

    res.render("students/index", {
        title: "Students",
        activePage: "Students",
        students: students.map(toView),
        openCreateModal,
        ...await studentFormOptions()
    });
};

// Get the create student page
// Create is a modal on the list page, so /students/new opens the list with the modal showing
async function getCreatePage(req, res){
    await renderStudentList(res, true);
}

// Save the new student from the create form
async function saveNewStudent(req, res){
    const personId = req.body.personId;
    const person = /^\d+$/.test(personId) ? await personRepo.findOneBy({id: personId}) : null;

    if (!person) {
        return res.status(400).type("text/plain").send(`Person with id ${escapeHtml(personId)} not found`);
    }
    if (await studentRepo.existsBy({person: {id: person.id}})) {
        return res.status(400).type("text/plain").send(`Person with id ${escapeHtml(personId)} is already a student`);
    }

    const newStudent = studentRepo.create({person});
    await applyForm(newStudent, req.body);
    await studentRepo.save(newStudent);

    res.redirect("/students");
}

// Get all students
async function getAllStudents(req, res){
    await renderStudentList(res, false);
}

// Get the edit page for one student
async function getEditPage(req, res){
    const student = await findStudent(req.params.id, {skills: true});

    if (!student) {
        return sendNotFound(res, req.params.id);
    }

    res.render("students/edit", {
        title: "Edit Student",
        activePage: "Students",
        student: toView(student),
        ...await studentFormOptions()
    });
}

// Save the edit form for one student
async function saveStudentEdits(req, res){
    const student = await findStudent(req.params.id, {skills: true});

    if (!student) {
        return sendNotFound(res, req.params.id);
    }

    await applyForm(student, req.body);
    await studentRepo.save(student);

    res.redirect(`/students/${student.id}`);
}

// Delete one student by id
// Removes only the student record; the underlying person is kept
async function deleteStudent(req, res){
    const student = await findStudent(req.params.id);

    if (!student) {
        return sendNotFound(res, req.params.id);
    }

    await studentRepo.remove(student);
    res.redirect("/students");
}

// Get one student by id
async function getStudent(req, res){
    const student = await findStudent(req.params.id, {skills: true, projects: true});

    if (!student) {
        return sendNotFound(res, req.params.id);
    }

    res.render("students/show", {
        title: "Student",
        activePage: "Students",
        student: toView(student),
        preferredProjectType: student.preferredProjectType,
        studentSkills: student.skills.map(withSkillName)
    });
}

module.exports = {getCreatePage,saveNewStudent,getAllStudents,getEditPage,saveStudentEdits,deleteStudent,getStudent}
