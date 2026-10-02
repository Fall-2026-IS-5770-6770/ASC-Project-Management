const express = require("express");
const router = express.Router();
const {
  getAll,
  getSingle,
  getEdit,
  postNew,
  postEdit,
  deleteSingle,
} = require("../controllers/ProjectStatusController");

// Route to handler functions
// Note that adding a new project-status is handled in a modal within the /all page, so no route exists
router.get("/all", getAll);
router.get("/:id", getSingle);
router.post("/new", postNew);
router.get("/edit/:id", getEdit);
router.post("/edit/:id", postEdit);
router.post("/delete/:id", deleteSingle);

module.exports = router;
