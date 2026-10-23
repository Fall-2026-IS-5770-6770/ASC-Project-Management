const people = require("../data/people");
const postgres = require("../app-data-source")
const PersonSkillsTable = require("../entities/PersonSkills.entities")

const personSkillsRepo = postgres.manager.getRepository(PersonSkillsTable)

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

//GET /people/:id/skills
const getAllPersonSkills = async (req,res) =>{
  const personSkill = await personSkillsRepo.find({
    where:{
      people:{id:req.params.id},
    },
    relations:{
      skill:true
    }
  })
  if (!personSkill){
    return res.status(404).send("Person skills not found")
  }
  res.render("Person/index", {personSkill})
}  

// GET /people/:id/skills
const getPersonSkill = async (req, res) => {
    const personSkill = await personSkillsRepo.findOne({
        where: {
            people: { id: req.params.id },
            skill: { id: req.params.skillId }
        },
        relations: {
            people: true,
            skill: true
        }
    });

    if (!personSkill) {
        return res.status(404).send("Person skill not found");
    }

    res.render("Person/index", { personSkill });
};

//POST /people/:id/skills/new
const createPersonSkill = async (req,res) =>{
  const newPersonSkill = await personSkillsRepo.create();
  newPersonSkill.people = { id: req.params.id };
  newPersonSkill.skill = { id: req.body.skillId };
  newPersonSkill.lastUsed = req.body.lastUsed;
  newPersonSkill.proficiency = req.body.proficiency;
  newPersonSkill.yearsExperience = Number(req.body.yearsExperience);
  await personSkillsRepo.save(newPersonSkill)
  res.redirect("/people/:id/skills?notice=created")
}

//POST /people/:id/skills/:skillId/edit
const updatePersonSkill = async (req,res) =>{
  const personSkill = await personSkillsRepo.findOne({
    where:{
      people:{id:req.params.id},
      skill:{id:req.params.skillId}
    }
});
  if (!personSkill){
    return res.status(404).send("Person skill not found")
  }
  personSkill.proficiency = req.body.proficiency;
  personSkill.lastUsed = req.body.lastUsed;
  personSkill.yearsExperience = Number(req.body.yearsExperience);
  await personSkillsRepo.save(personSkill);
  res.redirect(`/people/${req.params.id}/skills/${req.params.skillId}`);
}

//DELETE /people/:id/skills/:skillId/delete
const destroyPersonSkill = async (req,res) =>{
  const personSkill = await personSkillsRepo.findOneBy({id:req.params.id},{id:req.params.skillId});
  if (!personSkill) {
    return res.status(404).send("Person skill not found");
  }
  await personSkillsRepo.remove(personSkill);
  res.redirect(`/people/${req.params.id}`);
}



module.exports = {
  getCreatePerson,
  createPerson,
  getAllPeople,
  getEditPerson,
  updatePerson,
  deletePerson,
  getPerson,
  updatePersonSkill,
  createPersonSkill,
  getAllPersonSkills,
  getPersonSkill,
  destroyPersonSkill
};