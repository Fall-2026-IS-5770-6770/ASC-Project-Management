const express = require("express");
const {getCreateMentorPage, saveNewMentor, getAllMentors, getEditMentor, saveEditMentor, deleteMentor, getMentor} = require("../controllers/MentorController")

const router = express.Router();

router.get("/new", getCreateMentorPage);

router.post("/new", saveNewMentor);

router.get("", getAllMentors);

router.get("/edit/:id", getEditMentor);

router.post("/edit/:id", saveEditMentor);

router.post("/delete/:id", deleteMentor);

router.get("/:id", getMentor);

module.exports = router