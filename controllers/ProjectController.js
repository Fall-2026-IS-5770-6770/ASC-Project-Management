const projects = require("../data/projects");
const clients = require("../data/clients");
const mainBoardStatuses = require("../data/mainBoardStatuses");
const people = require("../data/people");
const mentors = require("../data/mentors");
const students = require("../data/students");
const projectPeople = require("../data/projectPeople");

// Main board columns, in the order they appear left to right
function sortedStatuses(){
    return [...mainBoardStatuses].sort((a, b) => a.order - b.order);
}

function findProject(id){
    return projects.find((project) => project.id === Number(id));
}

function personName(personId){
    const person = people.find((p) => p.id === personId);
    return person ? `${person.firstName} ${person.lastName}` : "Unassigned";
}

// Mentors and students are both people, so look up the person record for their name
function withPerson(records){
    return records.map((record) => ({ ...record, name: personName(record.personId) }));
}

// The people assigned to a project, with their names attached
function getTeam(projectId){
    return projectPeople
        .filter((assignment) => assignment.projectId === projectId)
        .map((assignment) => ({ ...assignment, name: personName(assignment.personId) }));
}

// Turn the form fields into a project object
function projectFromForm(body){
    return {
        name: body.name,
        description: body.description,
        clientId: Number(body.clientId),
        mainBoardStatusId: Number(body.mainBoardStatusId),
        projectManagerId: Number(body.projectManagerId),
        startDate: body.startDate,
        midpointDate: body.midpointDate,
        endDate: body.endDate,
        budget: Number(body.budget) || 0,
        estimatedHours: Number(body.estimatedHours) || 0,
        notes: body.notes
    };
}

// Create lives in a modal on the main board, so this route just sends you there
function getCreatePage(req, res){
    res.redirect("/projects");
}

// Save the new project from the create form
function saveNewProject(req, res){
    const nextId = projects.reduce((max, project) => Math.max(max, project.id), 0) + 1;
    projects.push({ id: nextId, ...projectFromForm(req.body) });
    res.redirect("/projects");
}

// Get all projects, shown as cards on the main board
function getAllProjects(req, res){
    const columns = sortedStatuses().map((status) => ({
        status,
        projects: projects
            .filter((project) => project.mainBoardStatusId === status.id)
            .map((project) => ({
                ...project,
                clientName: clients.find((c) => c.id === project.clientId)?.name ?? "No client",
                managerName: personName(project.projectManagerId)
            }))
    }));

    res.render("projects/index", {
        title: "Projects",
        activePage: "Projects",
        columns,
        clients,
        statuses: sortedStatuses(),
        managers: withPerson(mentors)
    });
}

// Get the edit page for one project
function getEditPage(req, res){
    const project = findProject(req.params.id);
    if (!project) {
        return res.status(404).send("Project not found");
    }

    const team = getTeam(project.id);
    const assignedIds = team.map((member) => member.personId);

    res.render("projects/edit", {
        title: `Edit ${project.name}`,
        activePage: "Projects",
        project,
        team,
        clients,
        statuses: sortedStatuses(),
        managers: withPerson(mentors),
        // Only offer people who aren't already on the project
        availableMentors: withPerson(mentors).filter((m) => !assignedIds.includes(m.personId)),
        availableStudents: withPerson(students).filter((s) => !assignedIds.includes(s.personId))
    });
}

// Save the edit form for one project
function saveProjectEdits(req, res){
    const project = findProject(req.params.id);
    if (!project) {
        return res.status(404).send("Project not found");
    }

    // The status dropdown submits on its own, so only update the fields that were sent
    const updates = projectFromForm(req.body);
    Object.keys(updates).forEach((key) => {
        if (req.body[key] !== undefined) {
            project[key] = updates[key];
        }
    });

    res.redirect(`/projects/edit/${project.id}`);
}

// Add a mentor or student to a project from the modals on the edit page
function addPersonToProject(role){
    return (req, res) => {
        const project = findProject(req.params.id);
        if (!project) {
            return res.status(404).send("Project not found");
        }

        const nextId = projectPeople.reduce((max, a) => Math.max(max, a.id), 0) + 1;
        projectPeople.push({
            id: nextId,
            projectId: project.id,
            personId: Number(req.body.personId),
            role,
            startDate: project.startDate,
            endDate: project.endDate,
            assignedHours: 0,
            approvalStatus: "Pending",
            status: "Pending Onboarding"
        });

        res.redirect(`/projects/edit/${project.id}`);
    };
}

const addMentor = addPersonToProject("Faculty Mentor");
const addStudent = addPersonToProject("Student");

// Delete one project by id
function deleteProject(req, res){
    const index = projects.findIndex((project) => project.id === Number(req.params.id));
    if (index !== -1) {
        projects.splice(index, 1);
    }
    res.redirect("/projects");
}

// Get one project by id
function getProject(req, res){
    const project = findProject(req.params.id);
    if (!project) {
        return res.status(404).send("Project not found");
    }

    res.render("projects/show", {
        title: project.name,
        activePage: "Projects",
        project,
        client: clients.find((c) => c.id === project.clientId),
        status: mainBoardStatuses.find((s) => s.id === project.mainBoardStatusId),
        managerName: personName(project.projectManagerId),
        team: getTeam(project.id)
    });
}

module.exports = {getCreatePage,saveNewProject,getAllProjects,getEditPage,saveProjectEdits,addMentor,addStudent,deleteProject,getProject}
