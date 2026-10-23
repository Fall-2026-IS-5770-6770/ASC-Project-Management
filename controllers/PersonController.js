const postgres = require("../app-data-source")
const PersonTable = require("../entities/Person.entities");
const personRepo = postgres.manager.getRepository(PersonTable);


async function getAllSortedPeople() {
  return await personRepo.find({order:{lastName:"ASC"}});
}

async function getCreatePerson(req, res) {
  const people = await getAllSortedPeople();
  res.render("people/index", {
    people,
    openCreateModal: true,
    personSubmitted: false,
    personDeleted: false
  });
}

async function createPerson(req, res) {
  const newPerson = personRepo.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email
  });
  await personRepo.save(newPerson);

  const people = await getAllSortedPeople();

  res.render("people/index", {
    people,
    openCreateModal: false,
    personSubmitted: true,
    personDeleted: false
  });
}

async function getAllPeople(req, res) {
  const people = await getAllSortedPeople();

  res.render("people/index", {
    people,
    openCreateModal: false,
    personSubmitted: false,
    personDeleted: false
  });
}

async function getEditPerson(req, res) {
  const person = await personRepo.findOneBy({ id: Number(req.params.id) });
  if (!person) return res.status(404).send("404 Person not found");

  res.render("people/edit", { person, submitted: false });
}

async function updatePerson(req, res) {
  const person = await personRepo.findOneBy({ id: Number(req.params.id) });
  if (!person) return res.status(404).send("Person not found");

  person.firstName = req.body.firstName;
  person.lastName = req.body.lastName;
  person.email = req.body.email;
  await personRepo.save(person);

  res.render("people/edit", { person, submitted: true });
}

async function deletePerson(req, res) {
  const person = await personRepo.findOneBy({ id: Number(req.params.id) });
  if (!person) return res.status(404).send("Person not found");

  await personRepo.remove(person);

  const people = await getAllSortedPeople();

  res.render("people/index", {
    people,
    openCreateModal: false,
    personSubmitted: false,
    personDeleted: true
  });
}

async function getPerson(req, res) {
  const person = await personRepo.findOne({where: { id: Number(req.params.id) },
  relations: {addresses:true, phoneNumbers:true}
  });
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