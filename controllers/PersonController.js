const people = require("../data/people");

function getCreatePerson(req, res) {
  res.render("people/index", {
    people,
    openCreateModal: true,
    personSubmitted: false,
    personDeleted: false
  });
}

function createPerson(req, res) {
  console.log("Submitted new person:", req.body.firstName);

  res.render("people/index", {
    people,
    openCreateModal: false,
    personSubmitted: true,
    personDeleted: false
  });
}

function getAllPeople(req, res) {
  const sortedPeople = [...people].sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  res.render("people/index", {
    people: sortedPeople,
    openCreateModal: false,
    personSubmitted: false,
    personDeleted: false
  });
}

function getEditPerson(req, res) {
  const person = people.find((p) => p.id === Number(req.params.id));
  if (!person) return res.status(404).send("404 Person not found");

  res.render("people/edit", { person, submitted: false });
}

function updatePerson(req, res) {
  const person = people.find((p) => p.id === Number(req.params.id));
  if (!person) return res.status(404).send("Person not found");

  console.log("Submitted email:", req.body.email);

  res.render("people/edit", { person, submitted: true });
}

function deletePerson(req, res) {
  const person = people.find((p) => p.id === Number(req.params.id));
  if (!person) return res.status(404).send("Person not found");

  console.log("Delete requested for person ID:", person.id);

  res.render("people/index", {
    people,
    openCreateModal: false,
    personSubmitted: false,
    personDeleted: true
  });
}

function getPerson(req, res) {
  const person = people.find((p) => p.id === Number(req.params.id));
  if (!person) return res.status(404).send("Person not found");

  res.render("people/show", { person });
}

module.exports = {
  getCreatePerson,
  createPerson,
  getAllPeople,
  getEditPerson,
  updatePerson,
  deletePerson,
  getPerson
};