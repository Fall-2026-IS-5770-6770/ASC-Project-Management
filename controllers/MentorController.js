// Mentors (Issue #25 pages, moved into a controller for Issue #63)
const escapeHtml = require("ejs").escapeXML;
const { request } = require("express");
const postgres = require('../app-data-sourse');
const MentorTable = require('../entities/Mentor.Entities');

const mentorRepo = postgres.manager.getRepository(MentorTable);

// GET /people
const index = async (req, res) => {
    const mentors = await mentorRepo.find({
            relations: {
                person: true,
                skills: true
            }
        });

        // Load existing people for the Create Mentor dropdown.
        const people = await personRepo.find();

        // Match the data structure expected by your EJS:
        // mentor.person.firstName
        // mentor.person.lastName
        // mentor.skills
        // mentor.mentor.id
        const mentorData = mentors.map((item) => ({
            mentor: item, person: item.person, skills: item.skills || []
        }));

        res.render('Mentor/index', {
            title: 'Mentors',mentorData, people, notice: req.query.notice
        });
 /*
    // const people = []; // TODO: load all people
  const mentor = await mentorRepo.find({relations:{messages:true}})  //SELECT ALL
  res.render("Mentor/index", { title: "Mentor", mentor, notice: req.query.notice });
 */
  };


// GET /mentor/new
const newForm = (req, res) => {
  res.render("Mentor/new", { title: "Add Mentor" });
};

// POST /mentor
const create = async (req, res) => {
    const person = await personRepo.findOne({where: { id: req.body.personId }});
    const newMentor = mentorRepo.create({person: person});
    await mentorRepo.save(newMentor);
    res.redirect("/mentor?notice=created");
  /*
    const newMentor = mentorRepo.create();
  newMentor.firstname = req.body.firstName;
  newMentor.lastname = req.body.lastName;
  await mentorRepo.save(newMentor);
  */
};

// GET /mentor/:id
const show = (req, res) => {
  res.render(`mentor/${req.params.id}`, { title: "Mentor Profile", id: req.params.id, mentor, notice: req.query.notice });
};

// GET /mentor/:id/edit
const editForm = (req, res) => {
  res.render(`mentor/edit/${req.params.id}`, { title: "Edit Mentor", id: req.params.id, mentor });
};

// POST /mentor/:id/edit
const update = async (req, res) => {
    const mentor = await mentorRepo.findOne({where:{id:req.params.id}, relations:{messages:true}});
    
    await mentorRepo.save(mentor);

  res.redirect(`/mentor/${req.params.id}?notice=updated`);
};

// POST /mentor/:id/delete
const destroy = async (req, res) => {
  await mentorRepo.remove(req.params.id)
  res.redirect("/mentor?notice=deleted");
};

module.exports = { index, newForm, create, show, editForm, update, destroy };



/*
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
*/

module.exports = { getCreateMentorPage, saveNewMentor, getAllMentors, getEditMentor, saveEditMentor, deleteMentor, getMentor };
