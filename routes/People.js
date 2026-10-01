const express = require("express");

const router = express.Router();

const {
  getCreatePerson,
  createPerson,
  getAllPeople,
  getEditPerson,
  updatePerson,
  deletePerson,
  getPerson
} = require("../controllers/PersonController");

router.get("/new", getCreatePerson);
router.post("/new", createPerson);

router.get("/", getAllPeople);

router.get("/edit/:id", getEditPerson);
router.post("/edit/:id", updatePerson);

router.post("/delete/:id", deletePerson);

router.get("/:id", getPerson);

module.exports = router;