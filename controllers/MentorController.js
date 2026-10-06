// Mentors (Issue #25 pages, moved into a controller for Issue #63)
const escapeHtml = require("ejs").escapeXML;

// GET /mentors/new
function getCreateMentorPage(req, res) {
    const people = require("../data/people");
    const projectTypes = require("../data/projectTypes")

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mentors</title>
        </head>

        <body>

            <h1>Mentors</h1>

            <h2>Create a New Mentor</h2>

            <form action="/mentors/new" method="POST">

                <label for="personId">Person:</label>

                <select name="personId" id="personId" required>

                    <option value="">Select a person</option>

                    ${people.map(person => `
                        <option value="${person.id}">
                            ${person.firstName} ${person.lastName}
                        </option>
                    `).join("")}

                </select>

                <br><br>

                <label for="department">Department:</label>
                <input
                    type="text"
                    name="department"
                    placeholder="Mentor Department"
                >

                <br><br>

                <label for="availability">Availability:</label>
                <input
                    type="text"
                    name="availability"
                    placeholder="Days and Times available"
                >

                <br><br>

                <label for="maxProjectLoad">Max Project Load:</label>
                <input
                    type="number" 
                    name="maxProjectLoad"
                >

                <br><br>

                <label for="preferredProjectTypeId">Preferred Project Type:</label>

                <select name="preferredProjectTypeId" id="preferredProjectTypeId" required>

                    <option value="">Preferred Project Type</option>

                    ${projectTypes.map(project => `
                        <option value="${project.id}">
                            ${project.name}
                        </option>
                    `)}

                </select>

                <input type="submit" value="Create Mentor">

            </form>

            <hr>

        </body>
        </html>
    `);
}

// POST /mentors/new
function saveNewMentor(req, res) {
    //console.log(req.body);
    //res.send("Saving a new mentor");
    const mentors = require("../data/mentors");

    const newMentor = {
        id: mentors.length + 1,
        personId: Number(req.body.personId),
        department: req.body.department,
        availability: req.body.availability,
        maxProjectLoad: Number(req.body.maxProjectLoad),
        preferredProjectTypeId: req.body.preferredProjectTypeId,
        skillIds: []
    };

    mentors.push(newMentor);

    res.redirect("/mentors");
}

// GET /mentors
function getAllMentors(req, res) {

    const mentors = require("../data/mentors");
    const people = require("../data/people");
    const skills = require("../data/skills");

    const mentorData = mentors.map((mentor) => {
        const person = people.find((p) => p.id === mentor.personId);

        const mentorSkills = mentor.skillIds.map((id) =>
            skills.find((s) => s.id === id)
        );

        return {
            mentor,
            person,
            skills: mentorSkills
        };
    });
    res.render("mentors/index.ejs", { mentorData });

}

// GET /mentors/edit/:id
function getEditMentor(req, res) {
    const mentors = require("../data/mentors");
    //res.send(`Edit mentor page for mentor ${req.params.id}`);
    const mentorId = Number(req.params.id);
    const selectedMentor = mentors.find(status => status.id === mentorId);

    if (!selectedMentor) {
        return res.status(404).send(`Status with id ${mentorId} not found`);
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Edit Status</title>
        </head>
        <body>
            <h2>Edit Mentor: ${selectedMentor.id}</h2>
            <form action="/mentors/edit/${selectedMentor.id}" method="POST">
                <input type="text" value="${selectedMentor.department}" name="mentor_deparment" required>
                <input type="text" value="${selectedMentor.availability}" name="mentor_availability" required>
                <input type="number" value="${selectedMentor.maxProjectLoad}" name="mentor_project_load" required>
                <input type="submit" value="Update">
            </form>
            <a href="/mentors">Cancel</a>
        </body>
        </html>
    `);
}

// POST /mentors/edit/:id
function saveEditMentor(req, res) {
    console.log(req.body);
    res.type("text/plain").send(`Saving an edit on mentor ${escapeHtml(req.params.id)}`);
}

// POST /mentors/delete/:id
function deleteMentor(req, res) {
    //res.send(`Deleting mentor ${req.params.id}`);
    const mentors = require("../data/mentors");

    const mentorId = Number(req.params.id);

    const index = mentors.findIndex(
        (mentor) => mentor.id === mentorId
    );

    if (index !== -1) {
        mentors.splice(index, 1);
    }

    res.redirect("/mentors");
}

// GET /mentors/:id
function getMentor(req, res) {
    res.type("text/plain").send(`Getting mentor ${escapeHtml(req.params.id)}`);
}

module.exports = { getCreateMentorPage, saveNewMentor, getAllMentors, getEditMentor, saveEditMentor, deleteMentor, getMentor };
